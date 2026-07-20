import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/api";

const GuestContext = createContext(null);
const STORAGE_KEY = "hallmark-residences-state-v1";

const toLocalDateKey = (date) => {
  const value = date instanceof Date ? date : new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toAmount = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
  }

  const parsedValue = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsedValue) ? Math.max(parsedValue, 0) : 0;
};

const getStringValue = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim() !== "");
  return value === undefined ? "" : String(value);
};

const getDateKey = (value) => {
  if (!value) {
    return "";
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toLocalDateKey(value);
  }

  const valueAsString = String(value);
  const isoDate = valueAsString.match(/^\d{4}-\d{2}-\d{2}/);

  if (isoDate) {
    return isoDate[0];
  }

  const parsedDate = new Date(valueAsString);
  return Number.isNaN(parsedDate.getTime()) ? valueAsString : toLocalDateKey(parsedDate);
};

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isReceptionVilla = (villa) => villa?.rentable !== false && String(villa?.number) !== "14";
const isReceptionGuest = (guest) => String(guest?.villaNumber) !== "14";

const normalizeStayStatus = (status) => {
  const normalized = String(status ?? "").trim().toUpperCase().replace(/\s+/g, "_");
  if (normalized === "CHECKED_OUT") return "CHECKED_OUT";
  if (normalized === "BOOKED" || normalized === "RESERVED") return "BOOKED";
  return "OCCUPIED";
};

const normalizeStayType = (stayType, checkOutDate) =>
  String(stayType ?? "").trim().toUpperCase() === "OPEN_STAY" || !checkOutDate ? "OPEN_STAY" : "FIXED_STAY";

const createDefaultSettings = () => ({
  companyName: "Hallmark Residences",
  receiptFooter: "Thank you for staying with Hallmark Residences.",
  currency: "USD",
  paymentMethods: ["Cash", "Mobile Money", "Bank Transfer", "Credit/Debit Card"],
  systemPreferences: {
    autoBackup: true,
    requireManagerApprovalOnCheckout: true,
    showNotifications: true,
  },
  userManagement: [
    { id: "admin", name: "Admin", role: "Manager" },
    { id: "reception", name: "Receptionist", role: "Reception" },
  ],
});

const createDefaultNotifications = () => [];

const createDefaultActivityLog = () => [
  {
    id: createId("log"),
    user: "Admin",
    action: "Guest Created",
    details: "Hallmark reception dashboard initialized.",
    date: toLocalDateKey(new Date()),
    time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  },
];

const createDefaultState = () => ({
  guests: [],
  villas: [],
  payments: [],
  receipts: [],
  activityLogs: createDefaultActivityLog(),
  notifications: createDefaultNotifications(),
  settings: createDefaultSettings(),
  searchQuery: "",
});

const normalizeGuest = (guest) => {
  const roomPrice = toAmount(guest.roomPrice ?? guest.totalAmount ?? guest.total ?? guest.price);
  const depositPaid = toAmount(guest.depositPaid ?? guest.amountPaid ?? guest.paid);
  const remainingBalance = toAmount(guest.remainingBalance ?? guest.balance ?? Math.max(roomPrice - depositPaid, 0));

  return {
    ...guest,
    id: guest.id !== undefined && guest.id !== null ? String(guest.id) : createId("guest"),
    name: getStringValue(guest.name, guest.fullName, guest.guestName),
    phone: getStringValue(guest.phone, guest.phoneNumber),
    email: getStringValue(guest.email),
    nationality: getStringValue(guest.nationality),
    identityNumber: getStringValue(guest.identityNumber, guest.idNumber, guest.passport, guest.nationalId),
    villaId: getStringValue(guest.villaId),
    villaNumber: getStringValue(guest.villaNumber, guest.villa?.number, guest.villaName),
    adults: toAmount(guest.adults ?? guest.adultCount),
    children: toAmount(guest.children ?? guest.childCount),
    checkInDate: getDateKey(guest.checkInDate ?? guest.checkIn),
    checkOutDate: getDateKey(guest.checkOutDate ?? guest.checkOut),
    roomPrice,
    depositPaid,
    remainingBalance,
    paymentMethod: getStringValue(guest.paymentMethod),
    paymentStatus: getStringValue(guest.paymentStatus) || (roomPrice > 0 && remainingBalance <= 0 ? "Paid" : depositPaid > 0 ? "Partial" : "Unpaid"),
    stayStatus: normalizeStayStatus(getStringValue(guest.stayStatus, guest.status)),
    stayType: normalizeStayType(guest.stayType, getDateKey(guest.checkOutDate ?? guest.checkOut)),
    notes: getStringValue(guest.notes),
    recordedByName: getStringValue(guest.recordedByName),
    recordedByUsername: getStringValue(guest.recordedByUsername),
    nextDueDate: getDateKey(guest.nextDueDate ?? guest.nextDue ?? guest.dueDate),
  };
};

const normalizeVillaStatus = (rawStatus) => {
  const normalizedStatus = String(rawStatus ?? "").trim().toUpperCase();

  if (["VACANT", "AVAILABLE", "FREE"].includes(normalizedStatus)) {
    return "Available";
  }

  if (["OCCUPIED", "IN_USE"].includes(normalizedStatus)) {
    return "Occupied";
  }

  if (normalizedStatus === "BOOKED") {
    return "Booked";
  }

  if (["MAINTENANCE", "UNDER_MAINTENANCE"].includes(normalizedStatus)) {
    return "Maintenance";
  }

  if (["CLEANING"].includes(normalizedStatus)) {
    return "Cleaning";
  }

  if (["HOUSEKEEPERS", "HOUSEKEEPING"].includes(normalizedStatus)) {
    return "Housekeepers";
  }

  if (["RESERVED", "HOLD"].includes(normalizedStatus)) {
    return "Reserved";
  }

  return getStringValue(rawStatus) || "Available";
};

const normalizeVilla = (villa) => {
  const number = getStringValue(villa.number, villa.name, villa.villaNumber);
  const normalizedNumber = number || `Villa ${villa.id || ""}`;
  const isVilla14 = normalizedNumber.toLowerCase().includes("villa 14") || normalizedNumber === "14";
  const status = normalizeVillaStatus(getStringValue(villa.status, villa.currentStatus));
  const rentable = isVilla14 ? false : Boolean(villa.rentable ?? true);
  const effectiveStatus = !rentable && !isVilla14 ? (status === "Available" ? "Maintenance" : status) : status;

  return {
    ...villa,
    id: villa.id !== undefined && villa.id !== null ? String(villa.id) : createId("villa"),
    number: normalizedNumber,
    status: effectiveStatus,
    rentable,
    guestId: villa.guestId ?? null,
    guestName: getStringValue(villa.guestName),
    checkOutDate: getStringValue(villa.checkOutDate),
    occupancy: toAmount(villa.occupancy),
    primaryTenantName: getStringValue(villa.primaryTenantName, villa.guestName),
    rentStatus: getStringValue(villa.rentStatus, "NOT_DUE"),
    cleaningPaymentStatus: getStringValue(villa.cleaningPaymentStatus, "DUE"),
    cleaningDay: getStringValue(villa.cleaningDay),
    assignedCleaners: getStringValue(villa.assignedCleaners),
    cleaningNextDueDate: getDateKey(villa.cleaningNextDueDate),
    notes: getStringValue(villa.notes),
  };
};

const normalizePayment = (payment) => ({
  ...payment,
  id: payment.id !== undefined && payment.id !== null ? String(payment.id) : createId("payment"),
  guestId: payment.guestId !== undefined && payment.guestId !== null ? String(payment.guestId) : payment.guest?.id ? String(payment.guest.id) : null,
  guestName: getStringValue(payment.guestName, payment.guest?.fullName, payment.guest?.name),
  amount: toAmount(payment.amount),
  method: getStringValue(payment.method),
  paymentType: getStringValue(payment.paymentType, "RENT"),
  status: getStringValue(payment.status),
  previousBalance: toAmount(payment.previousBalance),
  remainingBalance: toAmount(payment.remainingBalance),
  createdAt: payment.createdAt || payment.paidAt || new Date().toISOString(),
  receptionistName: getStringValue(payment.receptionistName, payment.receivedBy),
  paymentDuration: getStringValue(payment.paymentDuration),
  durationDays: payment.durationDays ? Number(payment.durationDays) : null,
});

const normalizeReceipt = (receipt) => ({
  ...receipt,
  id: receipt.id !== undefined && receipt.id !== null ? String(receipt.id) : createId("receipt"),
  guestId: receipt.guestId !== undefined && receipt.guestId !== null ? String(receipt.guestId) : receipt.guest?.id ? String(receipt.guest.id) : null,
  guestName: getStringValue(receipt.guestName, receipt.guest?.fullName, receipt.guest?.name),
  villaNumber: getStringValue(receipt.villaNumber),
  amount: toAmount(receipt.amount),
  previousBalance: toAmount(receipt.previousBalance),
  remainingBalance: toAmount(receipt.remainingBalance),
  paymentMethod: getStringValue(receipt.paymentMethod, receipt.method),
  paymentType: getStringValue(receipt.paymentType, "RENT"),
  receiptNumber: getStringValue(receipt.receiptNumber),
  date: getStringValue(receipt.date, receipt.issuedAt?.split("T")[0]),
  time: getStringValue(receipt.time, receipt.issuedAt?.split("T")[1]),
  receptionistName: getStringValue(receipt.receptionistName, receipt.receivedBy),
  companyFooter: getStringValue(receipt.companyFooter),
  dueDate: getStringValue(receipt.dueDate),
  phoneNumber: getStringValue(receipt.phoneNumber),
  primaryTenant: getStringValue(receipt.primaryTenant),
  paymentDuration: getStringValue(receipt.paymentDuration),
  durationDays: receipt.durationDays ? Number(receipt.durationDays) : null,
});

const normalizeNotification = (notification) => ({
  ...notification,
  id: notification.id ?? createId("notif"),
  title: getStringValue(notification.title),
  message: getStringValue(notification.message),
  type: getStringValue(notification.type, "info"),
  createdAt: notification.createdAt || new Date().toISOString(),
});

const normalizeDashboardPayload = (payload, guests, villas, payments) => {
  const currentGuests = guests.filter((guest) => guest.stayStatus !== "CHECKED_OUT");
  const dueGuests = currentGuests.filter((guest) => guest.remainingBalance > 0);
  const upcomingCheckouts = currentGuests
    .filter((guest) => guest.checkOutDate)
    .sort((left, right) => left.checkOutDate.localeCompare(right.checkOutDate))
    .slice(0, 5)
    .map((guest) => ({
      id: guest.id,
      guestName: guest.name,
      villaNumber: guest.villaNumber || "—",
      checkOutDate: guest.checkOutDate,
    }));

  const paymentReminders = dueGuests.slice(0, 4).map((guest) => ({
    id: guest.id,
    guestName: guest.name,
    villaNumber: guest.villaNumber || "—",
    amount: guest.remainingBalance,
  }));
  const reminders = Array.isArray(payload?.reminders) ? payload.reminders : paymentReminders.map((reminder) => ({
    ...reminder,
    type: "RENT_DUE",
    title: "Rent due",
    message: "Rent payment is due.",
  }));
  const rentableVillas = villas.filter((villa) => villa.rentable !== false);

  return {
    totalVillas: payload?.totalVillas ?? rentableVillas.length,
    occupiedVillas: payload?.occupiedVillas ?? rentableVillas.filter((villa) => villa.status === "Occupied").length,
    vacantVillas: payload?.vacantVillas ?? rentableVillas.filter((villa) => villa.status === "Available").length,
    bookedVillas: payload?.bookedVillas ?? currentGuests.filter((guest) => guest.stayStatus === "BOOKED").length,
    rentPaymentsDue: payload?.rentPaymentsDue ?? reminders.filter((reminder) => String(reminder.type).startsWith("RENT_")).length,
    cleaningPaymentsDue: payload?.cleaningPaymentsDue ?? reminders.filter((reminder) => String(reminder.type).startsWith("CLEANING_")).length,
    guestsCheckingOutThisWeek: payload?.guestsCheckingOutThisWeek ?? currentGuests.filter((guest) => guest.checkOutDate).length,
    actionRequired: payload?.actionRequired ?? reminders.length,
    reminders,
    maintenanceVillas: villas.filter((villa) => villa.status === "Maintenance").length,
    cleaningVillas: villas.filter((villa) => villa.status === "Housekeepers").length,
    totalGuests: guests.length,
    guestsCheckedInToday: guests.filter((guest) => guest.checkInDate === toLocalDateKey(new Date())).length,
    guestsCheckingOutToday: currentGuests.filter((guest) => guest.checkOutDate === toLocalDateKey(new Date())).length,
    paymentsReceivedToday: payments.filter((payment) => payment.createdAt?.startsWith(new Date().toISOString().slice(0, 10))).length,
    paymentsDueToday: paymentReminders.length,
    outstandingBalances: guests.reduce((total, guest) => total + guest.remainingBalance, 0),
    recentActivity: payload?.recentActivity || ["Dashboard synced with the Hallmark backend"],
    upcomingCheckouts,
    paymentReminders,
  };
};

const readStoredState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return null;
    }

    const parsed = JSON.parse(storedValue);
    return {
      guests: (parsed.guests || []).map(normalizeGuest).filter(isReceptionGuest),
      villas: (parsed.villas || []).map(normalizeVilla).filter(isReceptionVilla),
      payments: (parsed.payments || []).map(normalizePayment).filter((payment) => String(payment.villaNumber) !== "14"),
      receipts: (parsed.receipts || []).map(normalizeReceipt).filter((receipt) => String(receipt.villaNumber) !== "14"),
      activityLogs: parsed.activityLogs || createDefaultActivityLog(),
      notifications: (parsed.notifications || createDefaultNotifications()).map(normalizeNotification),
      settings: { ...createDefaultSettings(), ...(parsed.settings || {}) },
      searchQuery: parsed.searchQuery || "",
    };
  } catch (error) {
    console.warn("Unable to restore Hallmark state from local storage", error);
    return null;
  }
};

const createInitialState = () => {
  const storedState = readStoredState();
  return storedState || createDefaultState();
};

const createGuestPayload = (guestInput, villaLookup) => {
  const normalizedGuest = normalizeGuest(guestInput);
  const matchedVilla = villaLookup.find((villa) => villa.number === normalizedGuest.villaNumber || villa.id === normalizedGuest.villaId);

  return {
    fullName: normalizedGuest.name,
    phoneNumber: normalizedGuest.phone,
    idNumber: normalizedGuest.identityNumber,
    nationality: normalizedGuest.nationality,
    email: normalizedGuest.email,
    checkInDate: normalizedGuest.checkInDate || null,
    checkOutDate: normalizedGuest.checkOutDate || null,
    stayType: normalizedGuest.stayType,
    totalAmount: normalizedGuest.roomPrice,
    amountPaid: normalizedGuest.depositPaid,
    remainingBalance: normalizedGuest.remainingBalance,
    villaId: matchedVilla?.id ? Number(matchedVilla.id) : null,
    villaNumber: normalizedGuest.villaNumber,
    notes: normalizedGuest.notes,
  };
};

export function GuestProvider({ children }) {
  const initialState = useMemo(() => createInitialState(), []);
  const [guests, setGuests] = useState(initialState.guests);
  const [villas, setVillas] = useState(initialState.villas);
  const [payments, setPayments] = useState(initialState.payments);
  const [receipts, setReceipts] = useState(initialState.receipts);
  const [activityLogs, setActivityLogs] = useState(initialState.activityLogs);
  const [notifications, setNotifications] = useState(initialState.notifications);
  const [settings, setSettings] = useState(initialState.settings);
  const [dashboardPayload, setDashboardPayload] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ guests, villas, payments, receipts, activityLogs, notifications, settings, searchQuery }),
    );
  }, [activityLogs, guests, notifications, payments, receipts, searchQuery, settings, villas]);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [dashboardResponse, villasResponse, guestsResponse, paymentsResponse, receiptsResponse, notificationsResponse] = await Promise.all([
        api.get("/dashboard").catch(() => ({ data: {} })),
        api.get("/villas").catch(() => ({ data: [] })),
        api.get("/guests").catch(() => ({ data: [] })),
        api.get("/payments").catch(() => ({ data: [] })),
        api.get("/receipts").catch(() => ({ data: [] })),
        api.get("/notifications").catch(() => ({ data: [] })),
      ]);

      const nextVillas = (villasResponse.data || []).map(normalizeVilla).filter(isReceptionVilla);
      const nextGuests = (guestsResponse.data || []).map(normalizeGuest).filter(isReceptionGuest);
      const receptionGuestIds = new Set(nextGuests.map((guest) => String(guest.id)));
      const nextPayments = (paymentsResponse.data || []).map(normalizePayment)
        .filter((payment) => receptionGuestIds.has(String(payment.guestId)));
      const nextReceipts = (receiptsResponse.data || []).map(normalizeReceipt)
        .filter((receipt) => String(receipt.villaNumber) !== "14");
      const nextNotifications = (notificationsResponse.data || []).map(normalizeNotification);

      setDashboardPayload(dashboardResponse.data || {});
      setVillas(nextVillas);
      setGuests(nextGuests);
      setPayments(nextPayments);
      setReceipts(nextReceipts);
      setNotifications(nextNotifications);
      setSelectedGuest((currentSelected) => {
        if (!currentSelected) {
          return null;
        }

        return nextGuests.find((guest) => guest.id === currentSelected.id) || null;
      });
    } catch (err) {
      console.warn("Unable to sync with Hallmark backend", err);
      setError("Unable to sync with the Hallmark backend right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshTimer = window.setTimeout(refreshData, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [refreshData]);

  const selectGuest = useCallback((guest) => {
    setSelectedGuest(guest ?? null);
  }, []);

  const clearSelectedGuest = useCallback(() => {
    setSelectedGuest(null);
  }, []);

  const addActivityLog = useCallback((action, details, userName = "Admin") => {
    const entry = {
      id: createId("log"),
      user: userName,
      action,
      details,
      date: toLocalDateKey(new Date()),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    setActivityLogs((currentLogs) => [entry, ...currentLogs].slice(0, 20));
    return entry;
  }, []);

  const addNotification = useCallback((title, message, type = "info") => {
    const entry = {
      id: createId("notif"),
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
    };

    setNotifications((currentNotifications) => [normalizeNotification(entry), ...currentNotifications].slice(0, 6));
    return entry;
  }, []);

  const addGuest = useCallback(async (guest = {}) => {
    try {
      const payload = createGuestPayload(guest, villas);
      const response = await api.post("/guests", payload);
      const createdGuest = normalizeGuest(response.data);
      setGuests((currentGuests) => [createdGuest, ...currentGuests]);
      addActivityLog("Guest Created", `${createdGuest.name} was added to the register.`);
      addNotification("Guest created", `${createdGuest.name} is now on the Hallmark register.`, "info");
      await refreshData();
      return createdGuest;
    } catch (err) {
      console.warn("Unable to create guest", err);
      throw err;
    }
  }, [addActivityLog, addNotification, refreshData, villas]);

  const updateGuest = useCallback(async (guestId, updates = {}) => {
    const guestToUpdate = guests.find((guest) => guest.id === guestId);
    if (!guestToUpdate) {
      throw new Error("Guest not found.");
    }

    const normalizedPayload = createGuestPayload({ ...guestToUpdate, ...updates }, villas);
    const normalizedStatus = normalizeStayStatus(updates.stayStatus || guestToUpdate.stayStatus);

    try {
      let response;
      if (normalizedStatus === "CHECKED_OUT") {
        response = await api.post(`/guests/${guestId}/check-out`);
      } else {
        response = await api.put(`/guests/${guestId}`, normalizedPayload);
      }

      const updatedGuest = normalizeGuest(response.data);
      setGuests((currentGuests) => currentGuests.map((guest) => (guest.id === guestId ? updatedGuest : guest)));
      addActivityLog("Guest Updated", `${updatedGuest.name} was updated.`);
      await refreshData();
      return updatedGuest;
    } catch (err) {
      console.warn("Unable to update guest", err);
      throw err;
    }
  }, [addActivityLog, guests, refreshData, villas]);

  const updateVilla = useCallback(async (villaId, updates = {}) => {
    const villa = villas.find((item) => String(item.id) === String(villaId));
    if (!villa) {
      throw new Error("Villa not found.");
    }

    const response = await api.put(`/villas/${villaId}`, {
      number: villa.number,
      status: villa.status?.toUpperCase() === "AVAILABLE" ? "VACANT" : villa.status?.toUpperCase(),
      guestId: villa.guestId ? Number(villa.guestId) : null,
      guestName: villa.guestName,
      checkOutDate: villa.checkOutDate || null,
      type: updates.type ?? villa.type ?? "",
      occupancy: villa.occupancy || 0,
      rentStatus: villa.rentStatus || "NOT_DUE",
      cleaningPaymentStatus: villa.cleaningPaymentStatus || "DUE",
      cleaningDay: updates.cleaningDay ?? villa.cleaningDay ?? "",
      assignedCleaners: updates.assignedCleaners ?? villa.assignedCleaners ?? "",
      notes: updates.notes ?? villa.notes ?? "",
    });
    const updatedVilla = normalizeVilla(response.data);
    setVillas((currentVillas) => currentVillas.map((item) => String(item.id) === String(villaId) ? updatedVilla : item));
    await refreshData();
    return updatedVilla;
  }, [refreshData, villas]);

  const removeGuest = useCallback(async (guestId) => {
    const guestToRemove = guests.find((guest) => guest.id === guestId);
    try {
      await api.delete(`/guests/${guestId}`);
      setGuests((currentGuests) => currentGuests.filter((guest) => guest.id !== guestId));
      setPayments((currentPayments) => currentPayments.filter((payment) => payment.guestId !== guestId));
      setReceipts((currentReceipts) => currentReceipts.filter((receipt) => receipt.guestId !== guestId));
      if (guestToRemove) {
        addActivityLog("Guest Deleted", `${guestToRemove.name} was removed from the register.`);
        addNotification("Guest removed", `${guestToRemove.name} was removed from the register.`, "warning");
      }
      await refreshData();
    } catch (err) {
      console.warn("Unable to delete guest", err);
      throw err;
    }
  }, [addActivityLog, addNotification, guests, refreshData]);

  const addPayment = useCallback(async (guestId, paymentInput = {}) => {
    const guest = guests.find((item) => String(item.id) === String(guestId));
    if (!guest) {
      throw new Error("Guest not found.");
    }

    try {
      const amount = toAmount(paymentInput.amount);
      const method = paymentInput.method || guest.paymentMethod || settings.paymentMethods[0] || "Cash";
      const paymentDuration = paymentInput.paymentDuration || "Monthly";
      const durationDays = paymentInput.durationDays ? Number(paymentInput.durationDays) : null;
      const reference = paymentInput.reference || "";
      const notes = paymentInput.notes || `Payment for ${guest.name}`;
      const paymentType = paymentInput.paymentType || "RENT";
      const response = await api.post("/payments", {
        guestId: Number(guestId),
        amount,
        method,
        paymentType,
        reference,
        notes,
        paymentDuration,
        durationDays,
      });

      const paymentRecord = normalizePayment(response.data);
      setPayments((currentPayments) => [paymentRecord, ...currentPayments]);
      addActivityLog("Payment Added", `${guest.name} made a ${paymentType.toLowerCase()} payment of ${amount} via ${method}.`);
      addNotification("Payment completed", `${guest.name} made a payment of ${amount}.`, "success");
      const receiptResponse = await api.get(`/receipts/guest/${guestId}`);
      const receiptRecord = (receiptResponse.data || []).map(normalizeReceipt)[0] || null;
      await refreshData();

      return { paymentRecord, receiptRecord };
    } catch (err) {
      console.warn("Unable to record payment", err);
      throw err;
    }
  }, [addActivityLog, addNotification, guests, refreshData, settings.paymentMethods]);

  const completeCheckout = useCallback(async (guestId) => {
    const guest = guests.find((item) => String(item.id) === String(guestId));
    if (!guest) {
      return { success: false, message: "Guest not found." };
    }

    try {
      const response = await api.post(`/guests/${guestId}/check-out`);
      const updatedGuest = normalizeGuest(response.data);
      setGuests((currentGuests) => currentGuests.map((item) => (item.id === guestId ? updatedGuest : item)));
      addActivityLog("Guest Checked Out", `${guest.name} completed checkout.`);
      addNotification("Guest checked out", `${guest.name} completed checkout and the villa is ready for the next arrival.`, "info");
      await refreshData();
      return { success: true, guest: updatedGuest };
    } catch (err) {
      console.warn("Unable to complete checkout", err);
      return { success: false, message: "Unable to complete checkout." };
    }
  }, [addActivityLog, addNotification, guests, refreshData]);

  const updateSettings = useCallback((updates = {}) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      ...updates,
      systemPreferences: {
        ...currentSettings.systemPreferences,
        ...(updates.systemPreferences || {}),
      },
      paymentMethods: updates.paymentMethods || currentSettings.paymentMethods,
      userManagement: updates.userManagement || currentSettings.userManagement,
    }));
  }, []);

  const backupData = useCallback(() => {
    const payload = {
      guests,
      villas,
      payments,
      receipts,
      activityLogs,
      notifications,
      settings,
      generatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hallmark-backup-${toLocalDateKey(new Date())}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }

    addActivityLog("Backup Created", "A manual data backup was exported.");
    addNotification("Backup created", "A Hallmark backup file was exported successfully.", "info");
    return payload;
  }, [activityLogs, addActivityLog, addNotification, guests, notifications, payments, receipts, settings, villas]);

  const restoreBackup = useCallback((backupPayload) => {
    if (!backupPayload) {
      return false;
    }

    if (backupPayload.guests) {
      setGuests(backupPayload.guests.map(normalizeGuest));
    }
    if (backupPayload.villas) {
      setVillas(backupPayload.villas.map(normalizeVilla));
    }
    if (backupPayload.payments) {
      setPayments(backupPayload.payments.map(normalizePayment));
    }
    if (backupPayload.receipts) {
      setReceipts(backupPayload.receipts.map(normalizeReceipt));
    }
    if (backupPayload.activityLogs) {
      setActivityLogs(backupPayload.activityLogs);
    }
    if (backupPayload.notifications) {
      setNotifications(backupPayload.notifications.map(normalizeNotification));
    }
    if (backupPayload.settings) {
      setSettings({ ...createDefaultSettings(), ...backupPayload.settings });
    }

    addActivityLog("Backup Restored", "Hallmark data was restored from backup.");
    addNotification("Backup restored", "Hallmark data was restored from backup.", "success");
    return true;
  }, [addActivityLog, addNotification]);

  const dashboardSummary = useMemo(() => normalizeDashboardPayload(dashboardPayload, guests, villas, payments), [dashboardPayload, guests, payments, villas]);

  const statistics = useMemo(() => {
    const today = toLocalDateKey(new Date());
    const todayCheckIns = guests.filter((guest) => guest.checkInDate === today);
    const monthlyRevenue = guests.reduce((total, guest) => total + guest.depositPaid, 0);
    const paymentMethodCounts = payments.reduce((summary, payment) => {
      summary[payment.method] = (summary[payment.method] || 0) + 1;
      return summary;
    }, {});
    const mostUsedPaymentMethod = Object.entries(paymentMethodCounts).sort((left, right) => right[1] - left[1])[0]?.[0] || "—";

    return {
      totalGuests: guests.length,
      occupiedVillas: villas.filter((villa) => villa.status === "Occupied").length,
      availableVillas: villas.filter((villa) => villa.status === "Available").length,
      todaysCheckIns: todayCheckIns.length,
      todaysCheckOuts: guests.filter((guest) => guest.stayStatus !== "CHECKED_OUT" && guest.checkOutDate === today).length,
      todaysRevenue: todayCheckIns.reduce((total, guest) => total + guest.depositPaid, 0),
      monthlyRevenue,
      outstandingBalance: guests.reduce((total, guest) => total + guest.remainingBalance, 0),
      mostUsedPaymentMethod,
    };
  }, [guests, payments, villas]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }

    const matches = [];

    guests.forEach((guest) => {
      const haystack = [guest.name, guest.phone, guest.villaNumber].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        matches.push({ type: "Guest", label: guest.name, detail: `${guest.villaNumber} • ${guest.phone}` });
      }
    });

    [].forEach((receipt) => {
      const haystack = [receipt.receiptNumber, receipt.guestName, receipt.villaNumber].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        matches.push({ type: "Receipt", label: receipt.receiptNumber, detail: receipt.guestName });
      }
    });

    [].forEach((payment) => {
      const haystack = [payment.guestName, payment.method, payment.status].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        matches.push({ type: "Payment", label: payment.guestName, detail: `${payment.method} • ${payment.amount}` });
      }
    });

    villas.forEach((villa) => {
      const haystack = [villa.number, villa.guestName].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        matches.push({ type: "Villa", label: villa.number, detail: villa.guestName || villa.status });
      }
    });

    return matches.slice(0, 6);
  }, [guests, searchQuery, villas]);

  const value = useMemo(
    () => ({
      guests,
      villas,
      payments,
      receipts,
      activityLogs,
      notifications,
      settings,
      searchQuery,
      setSearchQuery,
      selectedGuest,
      selectGuest,
      clearSelectedGuest,
      addGuest,
      updateGuest,
      updateVilla,
      removeGuest,
      addPayment,
      completeCheckout,
      updateSettings,
      backupData,
      restoreBackup,
      addActivityLog,
      addNotification,
      searchResults,
      dashboardSummary,
      isLoading,
      error,
      refreshData,
      ...statistics,
    }),
    [activityLogs, addActivityLog, addNotification, addGuest, addPayment, backupData, clearSelectedGuest, completeCheckout, dashboardSummary, error, guests, isLoading, notifications, payments, receipts, removeGuest, restoreBackup, searchQuery, searchResults, selectedGuest, selectGuest, settings, statistics, updateGuest, updateVilla, updateSettings, villas, refreshData],
  );

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

export default GuestContext;
