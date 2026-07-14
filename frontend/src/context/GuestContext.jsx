import { createContext, useCallback, useEffect, useMemo, useState } from "react";

const GuestContext = createContext(null);
const STORAGE_KEY = "hallmark-residences-state-v1";

const toLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
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

const toAmount = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
  }

  const parsedValue = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsedValue) ? Math.max(parsedValue, 0) : 0;
};

const getStringValue = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null);
  return value === undefined ? "" : String(value);
};

const createGuestId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getPaymentStatus = ({ roomPrice, depositPaid, remainingBalance, paymentStatus }) => {
  if (paymentStatus) {
    return paymentStatus;
  }

  if (roomPrice > 0 && remainingBalance <= 0) {
    return "Paid";
  }

  return depositPaid > 0 ? "Partial" : "Unpaid";
};

const normalizeGuest = (guest) => {
  const roomPrice = toAmount(guest.roomPrice ?? guest.totalAmount);
  const depositPaid = toAmount(guest.depositPaid ?? guest.amountPaid);
  const suppliedBalance = guest.remainingBalance ?? guest.balance;
  const remainingBalance =
    suppliedBalance === undefined || suppliedBalance === null || suppliedBalance === ""
      ? Math.max(roomPrice - depositPaid, 0)
      : toAmount(suppliedBalance);

  return {
    ...guest,
    id: guest.id ?? createGuestId(),
    name: getStringValue(guest.name, guest.guestName),
    phone: getStringValue(guest.phone, guest.phoneNumber),
    email: getStringValue(guest.email),
    nationality: getStringValue(guest.nationality),
    identityNumber: getStringValue(
      guest.identityNumber,
      guest.passport,
      guest.nationalId,
      guest.nationalID,
    ),
    villaId: getStringValue(guest.villaId),
    villaNumber: getStringValue(
      guest.villaNumber,
      guest.villa?.number,
      typeof guest.villa === "string" || typeof guest.villa === "number" ? guest.villa : undefined,
    ),
    adults: toAmount(guest.adults),
    children: toAmount(guest.children),
    checkInDate: getDateKey(guest.checkInDate ?? guest.checkIn),
    checkOutDate: getDateKey(guest.checkOutDate ?? guest.checkOut),
    roomPrice,
    depositPaid,
    remainingBalance,
    paymentMethod: getStringValue(guest.paymentMethod),
    paymentStatus: getPaymentStatus({
      roomPrice,
      depositPaid,
      remainingBalance,
      paymentStatus: guest.paymentStatus,
    }),
    stayStatus: getStringValue(guest.stayStatus, guest.status) || "Reserved",
    notes: getStringValue(guest.notes),
  };
};

const initialVillas = [
  { id: "villa-01", number: "Villa 01", status: "Available" },
  { id: "villa-02", number: "Villa 02", status: "Available" },
  { id: "villa-03", number: "Villa 03", status: "Available" },
  { id: "villa-04", number: "Villa 04", status: "Available" },
  { id: "villa-05", number: "Villa 05", status: "Available" },
  { id: "villa-06", number: "Villa 06", status: "Available" },
  { id: "villa-07", number: "Villa 07", status: "Maintenance" },
  { id: "villa-08", number: "Villa 08", status: "Available" },
  { id: "villa-09", number: "Villa 09", status: "Available" },
  { id: "villa-10", number: "Villa 10", status: "Available" },
  { id: "villa-11", number: "Villa 11", status: "Available" },
  { id: "villa-12", number: "Villa 12", status: "Available" },
];

const initialGuests = [
  {
    id: "guest-001",
    name: "Aline Uwase",
    phone: "+250 788 210 408",
    email: "aline.uwase@example.com",
    nationality: "Rwandan",
    identityNumber: "1199980012345678",
    villaId: "villa-01",
    villaNumber: "Villa 01",
    adults: 2,
    children: 0,
    checkInDate: dateOffset(-2),
    checkOutDate: dateOffset(3),
    roomPrice: 720,
    depositPaid: 720,
    remainingBalance: 0,
    paymentMethod: "Credit/Debit Card",
    paymentStatus: "Paid",
    stayStatus: "Staying",
    notes: "Airport transfer arranged.",
  },
  {
    id: "guest-002",
    name: "David Njoroge",
    phone: "+254 712 445 980",
    email: "david.njoroge@example.com",
    nationality: "Kenyan",
    identityNumber: "A27845193",
    villaId: "villa-02",
    villaNumber: "Villa 02",
    adults: 2,
    children: 1,
    checkInDate: dateOffset(0),
    checkOutDate: dateOffset(4),
    roomPrice: 960,
    depositPaid: 400,
    remainingBalance: 560,
    paymentMethod: "Mobile Money",
    paymentStatus: "Partial",
    stayStatus: "Staying",
    notes: "Late arrival confirmed.",
  },
  {
    id: "guest-003",
    name: "Sarah Okafor",
    phone: "+234 803 616 4482",
    email: "sarah.okafor@example.com",
    nationality: "Nigerian",
    identityNumber: "B54629012",
    villaId: "villa-03",
    villaNumber: "Villa 03",
    adults: 1,
    children: 0,
    checkInDate: dateOffset(-4),
    checkOutDate: dateOffset(0),
    roomPrice: 880,
    depositPaid: 600,
    remainingBalance: 280,
    paymentMethod: "Bank Transfer",
    paymentStatus: "Partial",
    stayStatus: "Checking Out",
    notes: "Invoice requested at reception.",
  },
  {
    id: "guest-004",
    name: "Grace Mutesi",
    phone: "+250 788 649 911",
    email: "grace.mutesi@example.com",
    nationality: "Rwandan",
    identityNumber: "1199876543210987",
    villaId: "villa-04",
    villaNumber: "Villa 04",
    adults: 3,
    children: 0,
    checkInDate: dateOffset(2),
    checkOutDate: dateOffset(6),
    roomPrice: 1100,
    depositPaid: 0,
    remainingBalance: 1100,
    paymentMethod: "Cash",
    paymentStatus: "Unpaid",
    stayStatus: "Reserved",
    notes: "Corporate booking.",
  },
  {
    id: "guest-005",
    name: "Michael Brown",
    phone: "+1 415 555 0184",
    email: "michael.brown@example.com",
    nationality: "American",
    identityNumber: "XG4328901",
    villaId: "villa-08",
    villaNumber: "Villa 08",
    adults: 2,
    children: 0,
    checkInDate: dateOffset(-7),
    checkOutDate: dateOffset(-1),
    roomPrice: 1250,
    depositPaid: 1250,
    remainingBalance: 0,
    paymentMethod: "Credit/Debit Card",
    paymentStatus: "Paid",
    stayStatus: "Checked Out",
    notes: "Preferred a quiet villa.",
  },
].map(normalizeGuest);

const getVillaOccupancy = (guest) => {
  if (guest.stayStatus === "Staying" || guest.stayStatus === "Checking Out") {
    return { status: "Occupied", priority: 2 };
  }

  if (guest.stayStatus === "Reserved") {
    return { status: "Reserved", priority: 1 };
  }

  return null;
};

const deriveVillas = (guestList) => {
  const occupancyByVilla = new Map();

  guestList.forEach((guest) => {
    const occupancy = getVillaOccupancy(guest);

    if (!occupancy) {
      return;
    }

    const villa = initialVillas.find(
      (item) => item.id === guest.villaId || item.number === guest.villaNumber,
    );

    if (!villa || villa.status === "Maintenance") {
      return;
    }

    const currentOccupancy = occupancyByVilla.get(villa.id);
    if (!currentOccupancy || occupancy.priority > currentOccupancy.priority) {
      occupancyByVilla.set(villa.id, { ...occupancy, guest });
    }
  });

  return initialVillas.map((villa) => {
    if (villa.status === "Maintenance") {
      return { ...villa, guestId: null, guestName: "", checkOutDate: "" };
    }

    const occupancy = occupancyByVilla.get(villa.id);
    if (!occupancy) {
      return { ...villa, status: "Available", guestId: null, guestName: "", checkOutDate: "" };
    }

    return {
      ...villa,
      status: occupancy.status,
      guestId: occupancy.guest.id,
      guestName: occupancy.guest.name,
      checkOutDate: occupancy.guest.checkOutDate,
    };
  });
};

const createReceiptNumber = (receipts, targetYear = new Date().getFullYear()) => {
  const yearPrefix = `HRMS-${targetYear}`;
  const currentYearCount = receipts.filter((item) => item.receiptNumber?.startsWith(`${yearPrefix}-`)).length;
  return `${yearPrefix}-${String(currentYearCount + 1).padStart(6, "0")}`;
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

const createDefaultNotifications = () => {
  const currentDate = new Date();
  return [
    {
      id: createId("notif"),
      title: "Guest checking out today",
      message: "Sarah Okafor has a departure scheduled today.",
      type: "warning",
      createdAt: currentDate.toISOString(),
    },
    {
      id: createId("notif"),
      title: "Outstanding balance",
      message: "David Njoroge still has an outstanding balance of $560.",
      type: "warning",
      createdAt: currentDate.toISOString(),
    },
  ];
};

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
      guests: (parsed.guests || initialGuests).map(normalizeGuest),
      payments: parsed.payments || [],
      receipts: parsed.receipts || [],
      activityLogs: parsed.activityLogs || createDefaultActivityLog(),
      notifications: parsed.notifications || createDefaultNotifications(),
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

  if (storedState) {
    return storedState;
  }

  return {
    guests: initialGuests.map(normalizeGuest),
    payments: [],
    receipts: [],
    activityLogs: createDefaultActivityLog(),
    notifications: createDefaultNotifications(),
    settings: createDefaultSettings(),
    searchQuery: "",
  };
};

export function GuestProvider({ children }) {
  const initialState = useMemo(() => createInitialState(), []);
  const [guests, setGuests] = useState(initialState.guests);
  const [payments, setPayments] = useState(initialState.payments);
  const [receipts, setReceipts] = useState(initialState.receipts);
  const [activityLogs, setActivityLogs] = useState(initialState.activityLogs);
  const [notifications, setNotifications] = useState(initialState.notifications);
  const [settings, setSettings] = useState(initialState.settings);
  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ guests, payments, receipts, activityLogs, notifications, settings, searchQuery }),
    );
  }, [activityLogs, guests, notifications, payments, receipts, searchQuery, settings]);

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

    setNotifications((currentNotifications) => [entry, ...currentNotifications].slice(0, 6));
    return entry;
  }, []);

  const addGuest = useCallback((guest = {}) => {
    const newGuest = normalizeGuest({ ...guest, id: guest.id ?? createGuestId() });
    setGuests((currentGuests) => [...currentGuests, newGuest]);
    addActivityLog("Guest Created", `${newGuest.name} was added to the register.`);
    addNotification("Guest created", `${newGuest.name} is now on the Hallmark register.`, "info");
    return newGuest;
  }, [addActivityLog, addNotification]);

  const updateGuest = useCallback((guestId, updates = {}) => {
    setGuests((currentGuests) =>
      currentGuests.map((guest) =>
        guest.id === guestId ? normalizeGuest({ ...guest, ...updates, id: guestId }) : guest,
      ),
    );
  }, []);

  const removeGuest = useCallback((guestId) => {
    const guestToRemove = guests.find((guest) => guest.id === guestId);
    setGuests((currentGuests) => currentGuests.filter((guest) => guest.id !== guestId));
    setPayments((currentPayments) => currentPayments.filter((payment) => payment.guestId !== guestId));
    setReceipts((currentReceipts) => currentReceipts.filter((receipt) => receipt.guestId !== guestId));
    if (guestToRemove) {
      addActivityLog("Guest Deleted", `${guestToRemove.name} was removed from the register.`);
      addNotification("Guest removed", `${guestToRemove.name} was removed from the register.`, "warning");
    }
  }, [addActivityLog, addNotification, guests]);

  const addPayment = useCallback(
    (guestId, paymentInput = {}) => {
      const guest = guests.find((item) => item.id === guestId);
      if (!guest) {
        throw new Error("Guest not found.");
      }

      const amount = toAmount(paymentInput.amount);
      const previousBalance = toAmount(guest.remainingBalance);
      const amountPaid = toAmount(guest.depositPaid) + amount;
      const remainingBalance = Math.max(toAmount(guest.roomPrice) - amountPaid, 0);
      const paymentStatus = amountPaid >= toAmount(guest.roomPrice) ? "Paid" : amountPaid > 0 ? "Partial" : "Unpaid";
      const method = paymentInput.method || guest.paymentMethod || settings.paymentMethods[0] || "Cash";
      const normalizedGuest = normalizeGuest({
        ...guest,
        depositPaid: amountPaid,
        remainingBalance,
        paymentMethod: method,
        paymentStatus,
      });

      const receiptNumber = createReceiptNumber(receipts, new Date().getFullYear());
      const paymentRecord = {
        id: createId("payment"),
        guestId,
        guestName: guest.name,
        amount,
        method,
        status: paymentStatus,
        previousBalance,
        remainingBalance,
        receiptNumber,
        createdAt: new Date().toISOString(),
      };

      const receiptRecord = {
        id: createId("receipt"),
        guestId,
        guestName: guest.name,
        villaNumber: guest.villaNumber,
        amount,
        previousBalance,
        remainingBalance,
        paymentMethod: method,
        receiptNumber,
        date: toLocalDateKey(new Date()),
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        receptionistName: settings.userManagement?.[0]?.name || "Admin",
        companyFooter: settings.receiptFooter,
      };

      setGuests((currentGuests) => currentGuests.map((item) => (item.id === guestId ? normalizedGuest : item)));
      setPayments((currentPayments) => [paymentRecord, ...currentPayments]);
      setReceipts((currentReceipts) => [receiptRecord, ...currentReceipts]);
      addActivityLog("Payment Added", `${guest.name} received ${amount} via ${method}.`);
      addNotification("Payment completed", `${guest.name} made a payment of ${amount}.`, "success");

      return { paymentRecord, receiptRecord };
    },
    [addActivityLog, addNotification, guests, receipts, settings.paymentMethods, settings.receiptFooter, settings.userManagement],
  );

  const completeCheckout = useCallback(
    (guestId, options = {}) => {
      const guest = guests.find((item) => item.id === guestId);
      if (!guest) {
        return { success: false, message: "Guest not found." };
      }

      if (guest.remainingBalance > 0 && !options.managerApproved && settings.systemPreferences.requireManagerApprovalOnCheckout) {
        return {
          success: false,
          message: "Checkout requires manager approval while the guest still has an outstanding balance.",
        };
      }

      const updatedGuest = normalizeGuest({
        ...guest,
        stayStatus: "Checked Out",
        paymentStatus: guest.remainingBalance > 0 ? "Partial" : "Paid",
      });

      setGuests((currentGuests) => currentGuests.map((item) => (item.id === guestId ? updatedGuest : item)));

      const finalReceipt = {
        id: createId("receipt"),
        guestId,
        guestName: guest.name,
        villaNumber: guest.villaNumber,
        amount: guest.remainingBalance,
        previousBalance: guest.remainingBalance,
        remainingBalance: 0,
        paymentMethod: guest.paymentMethod || settings.paymentMethods[0] || "Cash",
        receiptNumber: createReceiptNumber(receipts, new Date().getFullYear()),
        date: toLocalDateKey(new Date()),
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        receptionistName: settings.userManagement?.[0]?.name || "Admin",
        companyFooter: settings.receiptFooter,
        note: "Final checkout settlement",
      };

      setReceipts((currentReceipts) => [finalReceipt, ...currentReceipts]);
      addActivityLog("Guest Checked Out", `${guest.name} completed checkout.`);
      addNotification("Guest checked out", `${guest.name} completed checkout and the villa is ready for the next arrival.`, "info");

      return { success: true, receipt: finalReceipt };
    },
    [addActivityLog, addNotification, guests, receipts, settings.paymentMethods, settings.receiptFooter, settings.systemPreferences.requireManagerApprovalOnCheckout, settings.userManagement],
  );

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
  }, [activityLogs, addActivityLog, addNotification, guests, notifications, payments, receipts, settings]);

  const restoreBackup = useCallback((backupPayload) => {
    if (!backupPayload) {
      return false;
    }

    if (backupPayload.guests) {
      setGuests(backupPayload.guests.map(normalizeGuest));
    }
    if (backupPayload.payments) {
      setPayments(backupPayload.payments);
    }
    if (backupPayload.receipts) {
      setReceipts(backupPayload.receipts);
    }
    if (backupPayload.activityLogs) {
      setActivityLogs(backupPayload.activityLogs);
    }
    if (backupPayload.notifications) {
      setNotifications(backupPayload.notifications);
    }
    if (backupPayload.settings) {
      setSettings({ ...createDefaultSettings(), ...backupPayload.settings });
    }

    addActivityLog("Backup Restored", "Hallmark data was restored from backup.");
    addNotification("Backup restored", "Hallmark data was restored from backup.", "success");
    return true;
  }, [addActivityLog, addNotification]);

  const villas = useMemo(() => deriveVillas(guests), [guests]);

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
      ...statistics,
    }),
    [activityLogs, addActivityLog, addNotification, addGuest, addPayment, backupData, clearSelectedGuest, completeCheckout, guests, notifications, payments, receipts, removeGuest, restoreBackup, searchQuery, searchResults, selectedGuest, selectGuest, settings, statistics, updateGuest, updateSettings, villas],
  );

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

export default GuestContext;
