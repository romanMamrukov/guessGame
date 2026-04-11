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

  if (selErr && selErr.code !== 'PGRST116') {
    console.error("Error finding user:", selErr);
  }

  const { data: newUser, error: insErr } = await supabase
    .from('users')
    .insert([{ username }])
    .select()
    .single();

  if (insErr) {
    console.error("Error creating user:", insErr);
    return res.status(500).json({ error: insErr.message });
  }
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

// Get dynamic categories list
app.get("/api/categories", async (req: Request, res: Response): Promise<any> => {
  const { data, error } = await supabase.from('objects').select('category');
  if (error) return res.status(500).json({ error: error.message });
  
  const categories = Array.from(new Set(data.map((item: any) => item.category)));
  if (categories.length === 0) categories.push('Animals', 'Vehicles', 'Fruits');
  
  return res.json(categories);
});

// Get next image based on category and difficulty
app.get("/api/images", async (req: Request, res: Response): Promise<any> => {
  try {
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
    
    if (error) {
      console.error("Database error fetching images:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!objects || objects.length === 0) {
      return res.status(404).json({ error: "No images found for this criteria" });
    }

    const randomObject = objects[Math.floor(Math.random() * objects.length)];

    const imgPath = randomObject.imagepath || randomObject.imagePath || '';
    const urlPrefix = process.env.NODE_ENV === 'production' 
      ? 'https://guessgame-x7zs.onrender.com' 
      : 'http://localhost:3000';
    const imageUrl = imgPath.startsWith('http') 
      ? imgPath 
      : `${urlPrefix}/${imgPath.startsWith('/') ? imgPath.slice(1) : imgPath}`;

    let specific_areas = null;
    try {
      if (randomObject.specific_areas) {
        specific_areas = JSON.parse(randomObject.specific_areas);
      }
    } catch (e) {
      console.warn("Invalid JSON in specific_areas for object:", randomObject.id);
    }

    return res.json({ 
      id: randomObject.id,
      imageUrl: imageUrl, 
      category: randomObject.category, 
      answer: randomObject.name,
      info: randomObject.info,
      specific_areas
    });
  } catch (err: any) {
    console.error("Critical error in /api/images:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
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

  const { name, category, difficulty, info, specific_areas, uploader } = req.body;
  
  if (!name || !category || !difficulty) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const uniqueFilename = `${Date.now()}-${name.replace(/[^a-zA-Z0-9]/g, '')}${path.extname(file.originalname)}`;
  
  // 0. AI Moderation Check (Content Filtering && Accurate Naming)
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{
          parts: [
            { inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') } },
            { text: `Analyze this image carefully. 1. Is it explicit, NSFW, or harmful? 2. Is the main subject accurately described by the name '${name}'? Respond strictly in JSON format exactly like this: {"explicit": boolean, "accurateName": boolean, "reason": "string"}` }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      };
      
      const aiRes = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!aiRes.ok) throw new Error("Gemini API error: " + aiRes.status);
      
      const aiData = await aiRes.json();
      const text = aiData.candidates[0].content.parts[0].text;
      const result = JSON.parse(text);
      
      if (result.explicit) {
        return res.status(400).json({ error: "Upload rejected: Image contains explicit or harmful content." });
      }
      if (!result.accurateName) {
        return res.status(400).json({ error: `Upload rejected: Image does not match the name '${name}'. AI says: ${result.reason}` });
      }
    } catch (err: any) {
      console.error("Moderation error:", err.message);
      return res.status(500).json({ error: "AI Moderation failed. Please try again." });
    }
  } else {
    console.warn("GEMINI_API_KEY not set - skipping AI validation phase.");
  }

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
      imagepath: imagePath,
      category,
      difficulty,
      info: info || null,
      specific_areas: specific_areas || null,
      uploader: uploader || null
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ id: data.id, name, imagePath, category });
});

// Update Object Stats
app.post("/api/objects/:id/stats", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { statType } = req.body; // 'stat_1st_try', 'stat_2nd_try', 'stat_3rd_try', 'stat_wrong', 'stat_skip'

  const validStats = ['stat_1st_try', 'stat_2nd_try', 'stat_3rd_try', 'stat_wrong', 'stat_skip'];
  if (!validStats.includes(statType)) {
    return res.status(400).json({ error: "Invalid stat type" });
  }

  // Get current stat value
  const { data: objectDetails } = await supabase.from('objects').select(statType).eq('id', id).single();
  
  if (!objectDetails) return res.status(404).json({ error: "Object not found" });

  const currentVal = Number(objectDetails[statType]) || 0;

  // Increment
  const updateData = { [statType]: currentVal + 1 };
  const { data: updatedObj, error } = await supabase
    .from('objects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(updatedObj);
});

// Get User Uploads Stats
app.get("/api/users/:username/uploads", async (req: Request, res: Response): Promise<any> => {
  const { username } = req.params;
  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .eq('uploader', username)
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});