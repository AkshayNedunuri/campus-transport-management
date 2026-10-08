/**
 * Standardized API Response Handlers
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = 500, message = 'An error occurred', error = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: typeof error === 'string' ? { message: error } : error,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
