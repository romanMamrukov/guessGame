import db from "./database";

db.exec(`
CREATE TABLE IF NOT EXISTS objects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  imagePath TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL
);
`);

console.log("Database schema initialized.");