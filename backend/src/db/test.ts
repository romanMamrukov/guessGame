import db from "./database";

const row = db.prepare("SELECT sqlite_version() AS version").get();

console.log("SQLite version:", row.version);