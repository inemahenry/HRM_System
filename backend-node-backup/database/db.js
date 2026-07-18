const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbFolder = path.join(__dirname, "..", "data");
const dbPath = path.join(dbFolder, "hallmark.db");

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

const db = new Database(dbPath);

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS villas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      guestId INTEGER,
      guestName TEXT,
      checkOutDate TEXT,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      nationality TEXT NOT NULL,
      identityNumber TEXT NOT NULL UNIQUE,
      villaId INTEGER NOT NULL,
      villaNumber TEXT NOT NULL,
      adults INTEGER NOT NULL,
      children INTEGER NOT NULL,
      checkInDate TEXT NOT NULL,
      checkOutDate TEXT NOT NULL,
      roomPrice REAL NOT NULL,
      depositPaid REAL NOT NULL,
      remainingBalance REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      paymentStatus TEXT NOT NULL,
      stayStatus TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(villaId) REFERENCES villas(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guestId INTEGER NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(guestId) REFERENCES guests(id)
    );
  `);
};

const initialize = () => {
  createTables();
};

initialize();

module.exports = db;
