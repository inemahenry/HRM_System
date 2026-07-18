import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const GuestContext = createContext(null);
const STORAGE_KEY = "hallmark-residences-state-v1";

const toLocalDateKey = (date) => {
  const value = date instanceof Date ? date : new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
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

const createReceiptNumber = (receipts, targetYear = new Date().getFullYear()) => {
  const yearPrefix = `HRMS-${targetYear}`;
  const currentYearCount = receipts.filter((item) => item.receiptNumber?.startsWith(`${yearPrefix}-`)).length;
  return `${yearPrefix}-${String(currentYearCount + 1).padStart(6, "0")}`;
};

const calculateNextDueDate = (paymentDuration, durationDays) => {
  const today = new Date();
  if (paymentDuration === "Monthly") {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return toLocalDateKey(nextMonth);
  }
  if (paymentDuration === "Daily") {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    return toLocalDateKey(nextDay);
  }
  if (durationDays && Number(durationDays) > 0) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + Number(durationDays));
    return toLocalDateKey(nextDate);
  }
  return toLocalDateKey(today);
};

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

const createDefaultNotifications = () => [
  {
    id: createId("notif"),
    title: "Guest checking out today",
    message: "A departure is scheduled for today.",
    type: "warning",
    createdAt: new Date().toISOString(),
  },
  {
    id: createId("notif"),
    title: "Outstanding balance",
    message: "One or more guests still have pending balances.",
    type: "warning",
    createdAt: new Date().toISOString(),
  },
];

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
    id: guest.id ?? createId("guest"),
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
    stayStatus: getStringValue(guest.stayStatus, guest.status) || "Reserved",
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

  if (["OCCUPIED", "IN_USE", "BOOKED"].includes(normalizedStatus)) {
    return "Occupied";
  }

  if (["MAINTENANCE", "UNDER_MAINTENANCE"].includes(normalizedStatus)) {
    return "Maintenance";
  }

  if (["CLEANING", "HOUSEKEEPERS", "HOUSEKEEPING"].includes(normalizedStatus)) {
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
    id: villa.id ?? createId("villa"),
    number: normalizedNumber,
    status: effectiveStatus,
    rentable,
    guestId: villa.guestId ?? null,
    guestName: getStringValue(villa.guestName),
    checkOutDate: getStringValue(villa.checkOutDate),
    notes: getStringValue(villa.notes),
  };
};

const normalizePayment = (payment) => ({
  ...payment,
  id: payment.id ?? createId("payment"),
  guestId: payment.guestId ?? payment.guest?.id,
  guestName: getStringValue(payment.guestName, payment.guest?.fullName, payment.guest?.name),
  amount: toAmount(payment.amount),
  method: getStringValue(payment.method),
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
  id: receipt.id ?? createId("receipt"),
  guestId: receipt.guestId ?? receipt.guest?.id,
  guestName: getStringValue(receipt.guestName, receipt.guest?.fullName, receipt.guest?.name),
  villaNumber: getStringValue(receipt.villaNumber),
  amount: toAmount(receipt.amount),
  previousBalance: toAmount(receipt.previousBalance),
  remainingBalance: toAmount(receipt.remainingBalance),
  paymentMethod: getStringValue(receipt.paymentMethod, receipt.method),
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
  const currentGuests = guests.filter((guest) => guest.stayStatus !== "Checked Out");
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

  return {
    totalVillas: villas.length,
    occupiedVillas: villas.filter((villa) => villa.status === "Occupied").length,
    vacantVillas: villas.filter((villa) => villa.status === "Available" || villa.status === "Reserved").length,
    maintenanceVillas: villas.filter((villa) => villa.status === "Maintenance").length,
    cleaningVillas: villas.filter((villa) => villa.status === "Housekeepers").length,
    totalGuests: guests.length,
    guestsCheckedInToday: guests.filter((guest) => guest.checkInDate === toLocalDateKey(new Date())).length,
    guestsCheckingOutToday: guests.filter((guest) => guest.checkOutDate === toLocalDateKey(new Date())).length,
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
      guests: (parsed.guests || []).map(normalizeGuest),
      villas: (parsed.villas || []).map(normalizeVilla),
      payments: (parsed.payments || []).map(normalizePayment),
      receipts: (parsed.receipts || []).map(normalizeReceipt),
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
    stayStatus: normalizedGuest.stayStatus || "Reserved",
    paymentStatus: normalizedGuest.paymentStatus || "Pending",
    checkInDate: normalizedGuest.checkInDate || null,
    checkOutDate: normalizedGuest.checkOutDate || null,
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
  const { user } = useAuth();

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

      const nextVillas = (villasResponse.data || []).map(normalizeVilla);
      const nextGuests = (guestsResponse.data || []).map(normalizeGuest);
      const nextPayments = (paymentsResponse.data || []).map(normalizePayment);
      const nextReceipts = (receiptsResponse.data || []).map(normalizeReceipt);
      const nextNotifications = (notificationsResponse.data || []).map(normalizeNotification);

      setDashboardPayload(dashboardResponse.data || {});
      setVillas(nextVillas);
      setGuests(nextGuests);
      setPayments(nextPayments);
      setReceipts(nextReceipts);
      setNotifications(nextNotifications.length ? nextNotifications : createDefaultNotifications().map(normalizeNotification));
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
    refreshData();
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
    const normalizedStatus = String(updates.stayStatus || guestToUpdate.stayStatus || "").toLowerCase();

    try {
      let response;
      if (normalizedStatus === "checked out") {
        response = await api.post(`/guests/${guestId}/check-out`);
      } else if (normalizedStatus === "staying") {
        response = await api.post(`/guests/${guestId}/check-in`, normalizedPayload);
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
    const guest = guests.find((item) => item.id === guestId);
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
      const currentUserName = user?.name || user?.fullName || user?.username || "Receptionist";
      const dueDate = calculateNextDueDate(paymentDuration, durationDays);
      const response = await api.post("/payments", {
        guestId: Number(guestId),
        amount,
        method,
        reference,
        notes,
        paymentDuration,
        durationDays,
      });

      const paymentRecord = normalizePayment(response.data);
      const receiptNumber = createReceiptNumber(receipts, new Date().getFullYear());
      const receiptRecord = {
        id: createId("receipt"),
        guestId,
        guestName: guest.name,
        villaNumber: guest.villaNumber,
        amount: paymentRecord.amount,
        previousBalance: guest.remainingBalance,
        remainingBalance: Math.max(guest.remainingBalance - paymentRecord.amount, 0),
        paymentMethod: method,
        receiptNumber,
        date: toLocalDateKey(new Date()),
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        receptionistName: currentUserName,
        receivedBy: currentUserName,
        companyFooter: settings.receiptFooter,
        dueDate,
        phoneNumber: guest.phone,
        primaryTenant: guest.name,
        paymentDuration,
        durationDays,
      };

      setPayments((currentPayments) => [paymentRecord, ...currentPayments]);
      setReceipts((currentReceipts) => [normalizeReceipt(receiptRecord), ...currentReceipts]);
      addActivityLog("Payment Added", `${guest.name} received ${amount} via ${method} by ${currentUserName}.`);
      addNotification("Payment completed", `${guest.name} made a payment of ${amount}.`, "success");
      await refreshData();

      return { paymentRecord, receiptRecord: normalizeReceipt(receiptRecord) };
    } catch (err) {
      console.warn("Unable to record payment", err);
      throw err;
    }
  }, [addActivityLog, addNotification, guests, receipts, refreshData, settings.paymentMethods, settings.receiptFooter, user]);

  const completeCheckout = useCallback(async (guestId, options = {}) => {
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) {
      return { success: false, message: "Guest not found." };
    }

    try {
      if (guest.remainingBalance > 0 && !options.managerApproved && settings.systemPreferences.requireManagerApprovalOnCheckout) {
        return {
          success: false,
          message: "Checkout requires manager approval while the guest still has an outstanding balance.",
        };
      }

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
  }, [addActivityLog, addNotification, guests, refreshData, settings.systemPreferences.requireManagerApprovalOnCheckout]);

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
      todaysCheckOuts: guests.filter((guest) => guest.checkOutDate === today).length,
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
      const haystack = [guest.name, guest.phone, guest.identityNumber, guest.villaNumber, guest.paymentStatus].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        matches.push({ type: "Guest", label: guest.name, detail: `${guest.villaNumber} • ${guest.phone}` });
      }
    });

    receipts.forEach((receipt) => {
      const haystack = [receipt.receiptNumber, receipt.guestName, receipt.villaNumber].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(query)) {
        matches.push({ type: "Receipt", label: receipt.receiptNumber, detail: receipt.guestName });
      }
    });

    payments.forEach((payment) => {
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
  }, [guests, payments, receipts, searchQuery, villas]);

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
    [activityLogs, addActivityLog, addNotification, addGuest, addPayment, backupData, clearSelectedGuest, completeCheckout, dashboardSummary, error, guests, isLoading, notifications, payments, receipts, removeGuest, restoreBackup, searchQuery, searchResults, selectedGuest, selectGuest, settings, statistics, updateGuest, updateSettings, villas, refreshData],
  );

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

export default GuestContext;
