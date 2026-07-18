const bcrypt = require("bcrypt");
const { findUserByUsername, createUser } = require("../models/userModel");

const ensureAdminUser = async () => {
  const admin = findUserByUsername("admin");
  if (!admin) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    createUser("admin", passwordHash, "admin");
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      const error = new Error("Username and password are required.");
      error.status = 400;
      throw error;
    }

    const user = findUserByUsername(username);
    if (!user) {
      const error = new Error("Invalid credentials.");
      error.status = 401;
      throw error;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      const error = new Error("Invalid credentials.");
      error.status = 401;
      throw error;
    }

    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  ensureAdminUser,
};
