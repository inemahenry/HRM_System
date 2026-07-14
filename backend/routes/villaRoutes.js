const express = require("express");
const { getVillas, getVilla, addVilla, patchVilla } = require("../controllers/villaController");

const router = express.Router();

router.get("/", getVillas);
router.get("/:id", getVilla);
router.post("/", addVilla);
router.patch("/:id", patchVilla);

module.exports = router;
