const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize SQLite DB
const db = new sqlite3.Database(path.join(__dirname, 'app.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      data BLOB NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS Attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL
    )`);
});

module.exports = db;
