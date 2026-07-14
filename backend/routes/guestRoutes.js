const express = require("express");
const {
  listGuests,
  getGuest,
  createNewGuest,
  editGuest,
  removeGuest,
  checkoutGuest,
} = require("../controllers/guestController");
const validateGuestPayload = require("../middleware/validateGuest");

const router = express.Router();

router.get("/", listGuests);
router.get("/:id", getGuest);
router.post("/", validateGuestPayload, createNewGuest);
router.put("/:id", validateGuestPayload, editGuest);
router.delete("/:id", removeGuest);
router.post("/:id/checkout", checkoutGuest);

module.exports = router;
