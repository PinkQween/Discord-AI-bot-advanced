const sqlite3 = require('sqlite3').verbose(); 

const db = new sqlite3.Database('./image_database.db');

db.run(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT,
    image BLOB
)`);

module.exports = (prompt, imageBuffer, callback) => db.run(`INSERT INTO images (prompt, image) VALUES (?, ?)`, [prompt, imageBuffer], callback);