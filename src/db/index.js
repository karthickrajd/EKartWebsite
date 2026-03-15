const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config');

const initDb = () => {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Failed to open DB:', err.message);
      process.exit(1);
    }
  });

  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        order_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`
    );
  });

  return db;
};

module.exports = initDb;
