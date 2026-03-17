import express, { Request, Response } from "express";
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

// Configure multer for image uploads (Memory Storage for Supabase)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "API running" });
});

// Users: Create or get user
app.post("/api/users", async (req: Request, res: Response): Promise<any> => {
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
  return res.json(newUser);
});

// Users: Update score
app.post("/api/score", async (req: Request, res: Response): Promise<any> => {
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
  return res.json(updatedUser);
});

// Leaderboard
app.get("/api/leaderboard", async (req: Request, res: Response): Promise<any> => {
  const { data, error } = await supabase
    .from('users')
    .select('username, total_score, games_played')
    .order('total_score', { ascending: false })
    .limit(10);
    
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Get next image based on category and difficulty
app.get("/api/images", async (req: Request, res: Response): Promise<any> => {
  const { category, difficulty } = req.query;
  
  let query = supabase.from('objects').select('*');
  
  if (category && category !== 'All Categories') {
    query = query.eq('category', category as string);
  }
  
  if (difficulty) {
    query = query.eq('difficulty', difficulty as string);
  }

  // Postgres Random selection 
  const { data: objects, error } = await query;
  
  if (error || !objects || objects.length === 0) {
    return res.status(404).json({ error: "No images found for this criteria" });
  }

  const randomObject = objects[Math.floor(Math.random() * objects.length)];

  // For backward compatibility, if it's a local route, prepend /
  const imageUrl = randomObject.imagePath.startsWith('http') 
    ? randomObject.imagePath 
    : (randomObject.imagePath.startsWith('/') ? randomObject.imagePath : '/' + randomObject.imagePath);

  return res.json({ 
    imageUrl: imageUrl, 
    category: randomObject.category, 
    answer: randomObject.name,
    info: randomObject.info,
    specific_areas: randomObject.specific_areas ? JSON.parse(randomObject.specific_areas) : null
  });
});

// Submit guess
app.post("/api/guess", (req: Request, res: Response) => {
  const { guess, correctAnswer } = req.body;
  const correct = guess.toLowerCase() === correctAnswer.toLowerCase();
  res.json({ correct });
});

// Upload new object to Supabase Storage Bucket
app.post("/api/objects", upload.single("image"), async (req: express.Request, res: express.Response): Promise<any> => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Image file required" });

  const { name, category, difficulty, info, specific_areas } = req.body;
  
  if (!name || !category || !difficulty) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const uniqueFilename = `${Date.now()}-${name.replace(/[^a-zA-Z0-9]/g, '')}${path.extname(file.originalname)}`;
  
  // 1. Upload the image directly to Supabase Bucket 'images'
  const { data: storageData, error: storageError } = await supabase.storage
    .from('images')
    .upload(uniqueFilename, file.buffer, {
      contentType: file.mimetype
    });

  if (storageError) {
    return res.status(500).json({ error: "Failed to upload image to storage: " + storageError.message });
  }

  // 2. Get the public URL for the newly uploaded image
  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(uniqueFilename);

  const imagePath = publicUrlData.publicUrl;

  // 3. Save reference in Postgres 'objects' table
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
  return res.json({ id: data.id, name, imagePath, category });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});