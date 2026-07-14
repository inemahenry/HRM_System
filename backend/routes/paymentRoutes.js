const express = require("express");
const { listPaymentsForGuest, addPayment } = require("../controllers/paymentController");

const router = express.Router();

router.get("/guest/:guestId", listPaymentsForGuest);
router.post("/", addPayment);

module.exports = router;
