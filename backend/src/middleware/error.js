const { errorResponse } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`[Error Handler]: ${err.stack || err.message}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;
    return errorResponse(res, 404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    return errorResponse(res, 400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return errorResponse(res, 400, message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Authentication token expired');
  }

  return errorResponse(
    res,
    err.statusCode || 500,
    error.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

module.exports = errorHandler;
