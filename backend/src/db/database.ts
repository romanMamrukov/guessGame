const Database = require("better-sqlite3");
import type { Database as BetterSqlite3Database } from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "../../../database/game.db");

const db: BetterSqlite3Database = new Database(dbPath);

export default db;