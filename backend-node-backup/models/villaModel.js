const db = require("../database/db");

const getAllVillas = () => {
  return db.prepare("SELECT * FROM villas ORDER BY number").all();
};

const findVillaById = (id) => {
  return db.prepare("SELECT * FROM villas WHERE id = ?").get(id);
};

const findVillaByNumber = (number) => {
  return db.prepare("SELECT * FROM villas WHERE number = ?").get(number);
};

const updateVilla = (id, updates) => {
  const fields = Object.keys(updates);
  const values = fields.map((field) => updates[field]);
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const stmt = db.prepare(`UPDATE villas SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`);
  stmt.run(...values, id);
  return findVillaById(id);
};

const createVilla = (number, status) => {
  const stmt = db.prepare("INSERT INTO villas (number, status) VALUES (?, ?)");
  const info = stmt.run(number, status);
  return findVillaById(info.lastInsertRowid);
};

module.exports = {
  getAllVillas,
  findVillaById,
  findVillaByNumber,
  updateVilla,
  createVilla,
};
