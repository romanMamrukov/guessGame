import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "API running" });
});

// Get next image
app.get("/api/images", (req, res) => {
  // Return JSON: { imageUrl: "...", category: "...", answer: "..." }
  res.json({ imageUrl: "../../assets/images/apple.png", category: "fruits", answer: "apple" });
});

// Submit guess
app.post("/api/guess", (req, res) => {
  const { guess, correctAnswer } = req.body;
  const correct = guess.toLowerCase() === correctAnswer.toLowerCase();
  res.json({ correct });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
//app.listen(3000, () => console.log("Server running on port 3000"));