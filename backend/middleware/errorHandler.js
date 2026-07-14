const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "An unexpected error occurred.";
  res.status(status).json({ success: false, message, errors: err.errors || null });
};

module.exports = errorHandler;
