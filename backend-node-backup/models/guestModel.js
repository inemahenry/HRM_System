const db = require("../database/db");

const getAllGuests = () => {
  return db.prepare("SELECT * FROM guests ORDER BY checkInDate DESC, createdAt DESC").all();
};

const findGuestById = (id) => {
  return db.prepare("SELECT * FROM guests WHERE id = ?").get(id);
};

const findGuestByPhone = (phone) => {
  return db.prepare("SELECT * FROM guests WHERE phone = ?").get(phone);
};

const findGuestByIdentity = (identityNumber) => {
  return db.prepare("SELECT * FROM guests WHERE identityNumber = ?").get(identityNumber);
};

const createGuest = (guest) => {
  const stmt = db.prepare(`
    INSERT INTO guests (
      name, phone, email, nationality, identityNumber,
      villaId, villaNumber, adults, children,
      checkInDate, checkOutDate, roomPrice, depositPaid, remainingBalance,
      paymentMethod, paymentStatus, stayStatus, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    guest.name,
    guest.phone,
    guest.email,
    guest.nationality,
    guest.identityNumber,
    guest.villaId,
    guest.villaNumber,
    guest.adults,
    guest.children,
    guest.checkInDate,
    guest.checkOutDate,
    guest.roomPrice,
    guest.depositPaid,
    guest.remainingBalance,
    guest.paymentMethod,
    guest.paymentStatus,
    guest.stayStatus,
    guest.notes,
  );

  return findGuestById(info.lastInsertRowid);
};

const updateGuest = (id, updates) => {
  const fields = Object.keys(updates);
  const values = fields.map((field) => updates[field]);
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const stmt = db.prepare(`UPDATE guests SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`);
  stmt.run(...values, id);
  return findGuestById(id);
};

const deleteGuest = (id) => {
  const stmt = db.prepare("DELETE FROM guests WHERE id = ?");
  return stmt.run(id);
};

module.exports = {
  getAllGuests,
  findGuestById,
  findGuestByPhone,
  findGuestByIdentity,
  createGuest,
  updateGuest,
  deleteGuest,
};
