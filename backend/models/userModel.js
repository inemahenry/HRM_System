const db = require("../database/db");

const findUserByUsername = (username) => {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
};

const createUser = (username, passwordHash, role = "admin") => {
  const stmt = db.prepare(
    "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
  );
  const info = stmt.run(username, passwordHash, role);
  return db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
};

module.exports = {
  findUserByUsername,
  createUser,
};
