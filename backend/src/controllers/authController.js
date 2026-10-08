const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_campus_transport_jwt_key_2026', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId, phone } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'An account with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      studentId: studentId || '',
      phone: phone || '',
    });

    const token = generateToken(user._id);

    return successResponse(res, 201, 'User registered successfully', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        phone: user.phone,
        favoriteStops: user.favoriteStops,
        favoriteRoutes: user.favoriteRoutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user._id);

    return successResponse(res, 200, 'Login successful', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        phone: user.phone,
        favoriteStops: user.favoriteStops,
        favoriteRoutes: user.favoriteRoutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteStops')
      .populate('favoriteRoutes');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'Current user retrieved', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear session
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  return successResponse(res, 200, 'Logged out successfully', {});
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
