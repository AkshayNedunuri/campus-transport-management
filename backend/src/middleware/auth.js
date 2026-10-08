const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

const requireAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized to access this route. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_campus_transport_jwt_key_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return errorResponse(res, 401, 'User no longer exists.');
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 401, 'Invalid or expired token.', { error: err.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }
    next();
  };
};

const requireStudent = authorize('student', 'admin');
const requireDriver = authorize('driver', 'admin');
const requireAdmin = authorize('admin');

module.exports = {
  requireAuth,
  authorize,
  requireStudent,
  requireDriver,
  requireAdmin,
};
