const {
  getAllGuests,
  findGuestById,
  findGuestByPhone,
  findGuestByIdentity,
  createGuest,
  updateGuest,
  deleteGuest,
} = require("../models/guestModel");
const { findVillaById, updateVilla, findVillaByNumber } = require("../models/villaModel");

const mapGuestRecord = (guest) => ({
  ...guest,
  paymentStatus: guest.paymentStatus,
  stayStatus: guest.stayStatus,
});

const listGuests = (req, res, next) => {
  try {
    const guests = getAllGuests();
    res.json({ success: true, data: guests.map(mapGuestRecord) });
  } catch (err) {
    next(err);
  }
};

const getGuest = (req, res, next) => {
  try {
    const guest = findGuestById(req.params.id);
    if (!guest) {
      const error = new Error("Guest not found.");
      error.status = 404;
      throw error;
    }
    res.json({ success: true, data: mapGuestRecord(guest) });
  } catch (err) {
    next(err);
  }
};

const getVillaStatusForStay = (stayStatus) => {
  if (stayStatus === "Reserved") return "Reserved";
  if (stayStatus === "Staying" || stayStatus === "Checking Out") return "Occupied";
  return "Available";
};

const createNewGuest = (req, res, next) => {
  try {
    const guestPayload = req.body;
    const villa = findVillaById(guestPayload.villaId);
    if (!villa) {
      const error = new Error("Selected villa does not exist.");
      error.status = 400;
      throw error;
    }

    const createdGuest = createGuest(guestPayload);
    updateVilla(villa.id, {
      status: getVillaStatusForStay(createdGuest.stayStatus),
      guestId: createdGuest.id,
      guestName: createdGuest.name,
      checkOutDate: createdGuest.checkOutDate,
    });

    res.status(201).json({ success: true, data: createdGuest });
  } catch (err) {
    next(err);
  }
};

const editGuest = (req, res, next) => {
  try {
    const guestId = req.params.id;
    const existingGuest = findGuestById(guestId);
    if (!existingGuest) {
      const error = new Error("Guest not found.");
      error.status = 404;
      throw error;
    }

    const updates = req.body;
    if (updates.villaId && updates.villaId !== existingGuest.villaId) {
      const previousVilla = findVillaById(existingGuest.villaId);
      const newVilla = findVillaById(updates.villaId);
      if (!newVilla) {
        const error = new Error("Selected villa does not exist.");
        error.status = 400;
        throw error;
      }
      if (previousVilla) {
        updateVilla(previousVilla.id, {
          status: "Available",
          guestId: null,
          guestName: null,
          checkOutDate: null,
        });
      }
      updateVilla(newVilla.id, {
        status: updates.stayStatus === "Checked Out" ? "Available" : "Occupied",
        guestId: existingGuest.id,
        guestName: updates.name || existingGuest.name,
        checkOutDate: updates.checkOutDate || existingGuest.checkOutDate,
      });
    }

    const updatedGuest = updateGuest(guestId, updates);
    res.json({ success: true, data: updatedGuest });
  } catch (err) {
    next(err);
  }
};

const removeGuest = (req, res, next) => {
  try {
    const guestId = req.params.id;
    const existingGuest = findGuestById(guestId);
    if (!existingGuest) {
      const error = new Error("Guest not found.");
      error.status = 404;
      throw error;
    }

    const villa = findVillaById(existingGuest.villaId);
    if (villa) {
      updateVilla(villa.id, {
        status: "Available",
        guestId: null,
        guestName: null,
        checkOutDate: null,
      });
    }

    deleteGuest(guestId);
    res.json({ success: true, successMessage: "Guest deleted successfully." });
  } catch (err) {
    next(err);
  }
};

const checkoutGuest = (req, res, next) => {
  try {
    const guestId = req.params.id;
    const guest = findGuestById(guestId);
    if (!guest) {
      const error = new Error("Guest not found.");
      error.status = 404;
      throw error;
    }

    const updatedGuest = updateGuest(guestId, {
      stayStatus: "Checked Out",
      paymentStatus: guest.remainingBalance <= 0 ? "Paid" : guest.paymentStatus,
    });

    const villa = findVillaById(guest.villaId);
    if (villa) {
      updateVilla(villa.id, {
        status: "Available",
        guestId: null,
        guestName: null,
        checkOutDate: null,
      });
    }

    res.json({ success: true, data: updatedGuest });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listGuests,
  getGuest,
  createNewGuest,
  editGuest,
  removeGuest,
  checkoutGuest,
};
