









const globalErrorHandler = (err, req, res , next) => {
  // Default error values
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  // Send error response
  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = globalErrorHandler;