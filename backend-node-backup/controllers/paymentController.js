const { createPayment, getPaymentsByGuestId } = require("../models/paymentModel");
const { findGuestById } = require("../models/guestModel");

const listPaymentsForGuest = (req, res, next) => {
  try {
    const { guestId } = req.params;
    const guest = findGuestById(guestId);
    if (!guest) {
      const error = new Error("Guest not found.");
      error.status = 404;
      throw error;
    }
    const payments = getPaymentsByGuestId(guestId);
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

const addPayment = (req, res, next) => {
  try {
    const { guestId, amount, method, status } = req.body;
    if (!guestId || !amount || !method || !status) {
      const error = new Error("Payment guestId, amount, method, and status are required.");
      error.status = 400;
      throw error;
    }

    const guest = findGuestById(guestId);
    if (!guest) {
      const error = new Error("Guest not found.");
      error.status = 404;
      throw error;
    }

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      const error = new Error("Payment amount must be a positive number.");
      error.status = 400;
      throw error;
    }

    const payment = createPayment({ guestId, amount: amountNumber, method, status });
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPaymentsForGuest,
  addPayment,
};
