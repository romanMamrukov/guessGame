import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import { supabase } from "./db/supabase";

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
app.post("/api/users", async (req: express.Request, res: express.Response) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  const { data: existingUser, error: selErr } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (existingUser) {
    return res.json(existingUser);
  }

  const { data: newUser, error: insErr } = await supabase
    .from('users')
    .insert([{ username }])
    .select()
    .single();

  if (insErr) return res.status(500).json({ error: insErr.message });
  res.json(newUser);
});

// Users: Update score
app.post("/api/score", async (req: express.Request, res: express.Response) => {
  const { username, score } = req.body;
  if (!username || score === undefined) return res.status(400).json({ error: "Missing data" });

  // Get current user stats
  const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
  if (!user) return res.status(404).json({ error: "User not found" });

  // Update
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update({ 
      total_score: user.total_score + score, 
      games_played: user.games_played + 1 
    })
    .eq('username', username)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(updatedUser);
});

// Leaderboard
app.get("/api/leaderboard", async (req: express.Request, res: express.Response) => {
  const { data, error } = await supabase
    .from('users')
    .select('username, total_score, games_played')
    .order('total_score', { ascending: false })
    .limit(10);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get next image based on category and difficulty
app.get("/api/images", async (req: express.Request, res: express.Response) => {
  const { category, difficulty } = req.query;
  
  let query = supabase.from('objects').select('*');
  
  if (category && category !== 'All Categories') {
    query = query.eq('category', category);
  }
  
  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  // Postgres Random selection 
  // (Alternatively, we fetch all ids and pick one in JS, avoiding slow random sorting on massive tables)
  const { data: objects, error } = await query;
  
  if (error || !objects || objects.length === 0) {
    return res.status(404).json({ error: "No images found for this criteria" });
  }

  const randomObject = objects[Math.floor(Math.random() * objects.length)];

  res.json({ 
    imageUrl: randomObject.imagePath.startsWith('/') ? randomObject.imagePath : '/' + randomObject.imagePath, 
    category: randomObject.category, 
    answer: randomObject.name,
    info: randomObject.info,
    specific_areas: randomObject.specific_areas ? JSON.parse(randomObject.specific_areas) : null
  });
});

// Submit guess
app.post("/api/guess", (req: express.Request, res: express.Response) => {
  const { guess, correctAnswer } = req.body;
  const correct = guess.toLowerCase() === correctAnswer.toLowerCase();
  res.json({ correct });
});

// Upload new object
app.post("/api/objects", upload.single("image"), async (req: express.Request, res: express.Response) => {
  if (!req.file) return res.status(400).json({ error: "Image file required" });

  const { name, category, difficulty, info, specific_areas } = req.body;
  
  if (!name || !category || !difficulty) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const imagePath = "/uploads/" + req.file.filename;

  const { data, error } = await supabase
    .from('objects')
    .insert([{
      name,
      imagePath,
      category,
      difficulty,
      info: info || null,
      specific_areas: specific_areas || null
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, name, imagePath, category });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});