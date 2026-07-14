const { getAllVillas, findVillaById, updateVilla, createVilla } = require("../models/villaModel");

const getVillas = (req, res, next) => {
  try {
    const villas = getAllVillas();
    res.json({ success: true, data: villas });
  } catch (err) {
    next(err);
  }
};

const getVilla = (req, res, next) => {
  try {
    const villa = findVillaById(req.params.id);
    if (!villa) {
      const error = new Error("Villa not found.");
      error.status = 404;
      throw error;
    }
    res.json({ success: true, data: villa });
  } catch (err) {
    next(err);
  }
};

const addVilla = (req, res, next) => {
  try {
    const { number, status } = req.body;
    if (!number || !status) {
      const error = new Error("Villa number and status are required.");
      error.status = 400;
      throw error;
    }
    const villa = createVilla(number, status);
    res.status(201).json({ success: true, data: villa });
  } catch (err) {
    next(err);
  }
};

const patchVilla = (req, res, next) => {
  try {
    const updates = req.body;
    const villa = updateVilla(req.params.id, updates);
    res.json({ success: true, data: villa });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVillas,
  getVilla,
  addVilla,
  patchVilla,
};
