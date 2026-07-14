const db = require("../database/db");

const getPaymentsByGuestId = (guestId) => {
  return db.prepare("SELECT * FROM payments WHERE guestId = ? ORDER BY createdAt DESC").all(guestId);
};

const createPayment = (payment) => {
  const stmt = db.prepare(
    "INSERT INTO payments (guestId, amount, method, status) VALUES (?, ?, ?, ?)",
  );
  const info = stmt.run(payment.guestId, payment.amount, payment.method, payment.status);
  return db.prepare("SELECT * FROM payments WHERE id = ?").get(info.lastInsertRowid);
};

module.exports = {
  getPaymentsByGuestId,
  createPayment,
};
