import db from "./database";

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS objects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  imagePath TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  info TEXT,
  specific_areas TEXT
);
`);

console.log("Database schema initialized.");