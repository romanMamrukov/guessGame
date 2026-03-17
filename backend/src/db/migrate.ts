import db from "./database";

try {
  // We'll alter the table if it exists, or just recreate it by dropping it
  // Since it's MVP, to make it clean, let's drop the existing tables
  db.exec(`DROP TABLE IF EXISTS objects;`);
  db.exec(`DROP TABLE IF EXISTS users;`);

  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      total_score INTEGER DEFAULT 0,
      games_played INTEGER DEFAULT 0
    );

    CREATE TABLE objects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      imagePath TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      info TEXT,
      specific_areas TEXT
    );
  `);
  
  // Seed some initial data so the game can be played
  const insertObj = db.prepare(`
    INSERT INTO objects (name, imagePath, category, difficulty, info, specific_areas) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  
  insertObj.run(
    'apple', 
    '/assets/images/apple.png', 
    'fruits', 
    'Easy', 
    'Apples are rich in fiber, vitamins, and minerals.', 
    null
  );

  console.log("Database schema migrated and seeded successfully.");
} catch (error) {
  console.error("Migration failed:", error);
}
