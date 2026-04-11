import { supabase } from './supabase';

async function migrate() {
  console.log("Setting up Supabase tables...");
  
  // Note: While we could attempt to create tables via RPC or raw SQL,
  // the best practice for Supabase is to run these via the SQL Editor in the Dashboard.
  // We will provide the SQL schema here so the user can paste it.
  
  const sql = `
-- Drop existing tables if they exist
DROP TABLE IF EXISTS objects;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create objects table
CREATE TABLE objects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  imagePath TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT,
  info TEXT,
  specific_areas TEXT,
  uploader TEXT,
  stat_1st_try INTEGER DEFAULT 0,
  stat_2nd_try INTEGER DEFAULT 0,
  stat_3rd_try INTEGER DEFAULT 0,
  stat_wrong INTEGER DEFAULT 0,
  stat_skip INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Note: If you already have the objects table, run these ALTER statements instead:
/*
ALTER TABLE objects 
  ADD COLUMN IF NOT EXISTS uploader TEXT,
  ADD COLUMN IF NOT EXISTS stat_1st_try INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_2nd_try INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_3rd_try INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_wrong INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_skip INTEGER DEFAULT 0;
*/

-- Insert initial seeder data
INSERT INTO objects (name, imagePath, category, difficulty, info) 
VALUES ('apple', '/assets/images/apple.png', 'Fruits', 'Easy', 'Apples are a great source of fiber and vitamin C.')
ON CONFLICT DO NOTHING;
  `;
  
  console.log("\n=============================================");
  console.log("IMPORTANT! Supabase Setup Required");
  console.log("=============================================\n");
  console.log("Please copy the following SQL code and paste it into the 'SQL Editor' in your Supabase Dashboard:");
  console.log("https://supabase.com/dashboard/project/_/sql");
  console.log("\n" + sql + "\n");
}

migrate().catch(console.error);
