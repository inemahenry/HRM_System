const express = require("express");
const cors = require("cors");
const path = require("path");
const { ensureAdminUser } = require("./controllers/authController");
const authRoutes = require("./routes/authRoutes");
const guestRoutes = require("./routes/guestRoutes");
const villaRoutes = require("./routes/villaRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const errorHandler = require("./middleware/errorHandler");
const { getAllVillas } = require("./models/villaModel");
const db = require("./database/db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const initializeVillas = () => {
  const existingVillas = getAllVillas();
  if (!existingVillas.length) {
    const villaNumbers = Array.from({ length: 12 }, (_, index) => `Villa ${String(index + 1).padStart(2, "0")}`);
    const stmt = db.prepare("INSERT INTO villas (number, status) VALUES (?, ?)");
    const insert = db.transaction((villaList) => {
      villaList.forEach((number) => stmt.run(number, "Available"));
    });
    insert(villaNumbers);
  }
};

(async () => {
  try {
    await ensureAdminUser();
    initializeVillas();
  } catch (error) {
    console.error("Failed to initialize backend:", error);
  }
})();

app.use("/api/auth", authRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/villas", villaRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
