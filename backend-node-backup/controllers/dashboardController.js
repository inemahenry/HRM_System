const { getAllGuests } = require("../models/guestModel");
const { getAllVillas } = require("../models/villaModel");

const getDashboardStats = (req, res, next) => {
  try {
    const guests = getAllGuests();
    const villas = getAllVillas();
    const today = new Date().toISOString().slice(0, 10);

    const totalGuests = guests.length;
    const occupiedVillas = villas.filter((villa) => villa.status === "Occupied").length;
    const availableVillas = villas.filter((villa) => villa.status === "Available").length;
    const todaysCheckIns = guests.filter((guest) => guest.checkInDate === today).length;
    const todaysCheckOuts = guests.filter((guest) => guest.checkOutDate === today).length;
    const todaysRevenue = guests
      .filter((guest) => guest.checkInDate === today)
      .reduce((sum, guest) => sum + (guest.depositPaid || 0), 0);
    const outstandingBalance = guests.reduce((sum, guest) => sum + (guest.remainingBalance || 0), 0);

    res.json({
      success: true,
      data: {
        totalGuests,
        occupiedVillas,
        availableVillas,
        todaysCheckIns,
        todaysCheckOuts,
        todaysRevenue,
        outstandingBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
};
