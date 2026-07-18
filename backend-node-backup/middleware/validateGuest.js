const { findGuestByPhone, findGuestByIdentity } = require("../models/guestModel");

const validateGuestPayload = (req, res, next) => {
  const {
    name,
    phone,
    email,
    nationality,
    identityNumber,
    villaId,
    villaNumber,
    adults,
    children,
    checkInDate,
    checkOutDate,
    roomPrice,
    depositPaid,
    paymentMethod,
  } = req.body;

  const errors = {};

  if (!name || !name.trim()) errors.name = "Guest name is required.";
  if (!phone || !phone.trim()) errors.phone = "Phone number is required.";
  if (!email || !email.trim()) errors.email = "Email is required.";
  if (!nationality || !nationality.trim()) errors.nationality = "Nationality is required.";
  if (!identityNumber || !identityNumber.trim()) errors.identityNumber = "National ID or passport is required.";
  if (!villaId) errors.villaId = "Villa selection is required.";
  if (!villaNumber || !villaNumber.trim()) errors.villaNumber = "Villa number is required.";
  if (!Number.isInteger(Number(adults)) || Number(adults) < 1) errors.adults = "Adults must be at least 1.";
  if (!Number.isInteger(Number(children)) || Number(children) < 0) errors.children = "Children must be 0 or more.";
  if (!checkInDate) errors.checkInDate = "Check-in date is required.";
  if (!checkOutDate) errors.checkOutDate = "Check-out date is required.";
  if (checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate)) errors.checkOutDate = "Check-out must be after check-in.";
  if (!Number.isFinite(Number(roomPrice)) || Number(roomPrice) <= 0) errors.roomPrice = "Room price must be greater than 0.";
  if (!Number.isFinite(Number(depositPaid)) || Number(depositPaid) < 0) errors.depositPaid = "Deposit must be zero or greater.";
  if (Number(roomPrice) >= 0 && Number(depositPaid) > Number(roomPrice)) errors.depositPaid = "Deposit cannot exceed room price.";
  if (!paymentMethod || !paymentMethod.trim()) errors.paymentMethod = "Payment method is required.";

  const existingPhone = findGuestByPhone(phone);
  if (existingPhone && String(existingPhone.id) !== String(req.params.id)) {
    errors.phone = "A guest with this phone number already exists.";
  }

  const existingIdentity = findGuestByIdentity(identityNumber);
  if (existingIdentity && String(existingIdentity.id) !== String(req.params.id)) {
    errors.identityNumber = "A guest with this passport or ID already exists.";
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error("Guest validation failed.");
    error.status = 400;
    error.errors = errors;
    return next(error);
  }

  next();
};

module.exports = validateGuestPayload;
