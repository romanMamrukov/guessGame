import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import db from "./db/database";

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));
app.use("/assets", express.static(path.join(__dirname, "../../assets")));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Assuming you have an 'uploads' directory at the project root
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Health check
app.get("/api/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "API running" });
});

// Users: Create or get user
app.post("/api/users", (req: express.Request, res: express.Response) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  const existingUser = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (existingUser) {
    return res.json(existingUser);
  }

  const result = db.prepare("INSERT INTO users (username) VALUES (?)").run(username);
  res.json({ id: result.lastInsertRowid, username, total_score: 0, games_played: 0 });
});

// Users: Update score
app.post("/api/score", (req: express.Request, res: express.Response) => {
  const { username, score } = req.body;
  if (!username || score === undefined) return res.status(400).json({ error: "Missing data" });

  db.prepare("UPDATE users SET total_score = total_score + ?, games_played = games_played + 1 WHERE username = ?").run(score, username);
  
  const updatedUser = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  res.json(updatedUser);
});

// Leaderboard
app.get("/api/leaderboard", (req: express.Request, res: express.Response) => {
  const topUsers = db.prepare("SELECT username, total_score, games_played FROM users ORDER BY total_score DESC LIMIT 10").all();
  res.json(topUsers);
});

// Get next image based on category and difficulty
app.get("/api/images", (req: express.Request, res: express.Response) => {
  const { category, difficulty } = req.query;
  
  let query = "SELECT * FROM objects WHERE 1=1";
  const params: any[] = [];
  
  if (category && category !== 'All Categories') {
    query += " AND category = ?";
    params.push(category);
  }
  
  if (difficulty) {
    query += " AND difficulty = ?";
    params.push(difficulty);
  }

  // Get a random image matching the criteria
  query += " ORDER BY RANDOM() LIMIT 1";
  
  const object: any = db.prepare(query).get(...params);
  
  if (!object) {
    return res.status(404).json({ error: "No images found for this criteria" });
  }

  res.json({ 
    imageUrl: object.imagePath.startsWith('/') ? object.imagePath : '/' + object.imagePath, 
    category: object.category, 
    answer: object.name,
    info: object.info,
    specific_areas: object.specific_areas ? JSON.parse(object.specific_areas) : null
  });
});

// Submit guess
app.post("/api/guess", (req: express.Request, res: express.Response) => {
  const { guess, correctAnswer } = req.body;
  const correct = guess.toLowerCase() === correctAnswer.toLowerCase();
  res.json({ correct });
});

// Upload new object
app.post("/api/objects", upload.single("image"), (req: express.Request, res: express.Response) => {
  if (!req.file) return res.status(400).json({ error: "Image file required" });

  const { name, category, difficulty, info, specific_areas } = req.body;
  
  if (!name || !category || !difficulty) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const imagePath = "/uploads/" + req.file.filename;

  const insert = db.prepare(`
    INSERT INTO objects (name, imagePath, category, difficulty, info, specific_areas) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = insert.run(name, imagePath, category, difficulty, info || null, specific_areas || null);

  res.json({ id: result.lastInsertRowid, name, imagePath, category });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
//app.listen(3000, () => console.log("Server running on port 3000"));