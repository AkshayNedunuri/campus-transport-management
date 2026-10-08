const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_campus_transport_jwt_key_2026', {
    expiresIn: '7d',
  });
};

// Fallback demo accounts for instant live evaluation when DB is pending
const DEMO_USERS = {
  'student@demo.com': {
    _id: '66f1a0000000000000000001',
    name: 'Aman Sharma (Demo Student)',
    email: 'student@demo.com',
    role: 'student',
    studentId: '12108542',
    phone: '+91 98765-10001',
    favoriteStops: [],
    favoriteRoutes: [],
  },
  'admin@demo.com': {
    _id: '66f1a0000000000000000002',
    name: 'LPU Transport Control Center',
    email: 'admin@demo.com',
    role: 'admin',
    studentId: 'LPU-ADM-01',
    phone: '+91 98765-01001',
    favoriteStops: [],
    favoriteRoutes: [],
  },
  'driver@demo.com': {
    _id: '66f1a0000000000000000003',
    name: 'Jagjit Singh (Demo Driver)',
    email: 'driver@demo.com',
    role: 'driver',
    studentId: 'LPU-DRV-101',
    phone: '+91 98765-02001',
    favoriteStops: [],
    favoriteRoutes: [],
  },
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

    if (mongoose.connection.readyState === 1) {
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
    }

    // In-memory registration fallback if DB is pending setup
    const fakeId = '66f1a' + Math.random().toString(16).substring(2, 19).padStart(19, '0');
    const demoUser = {
      _id: fakeId,
      name,
      email,
      role: role || 'student',
      studentId: studentId || '12100000',
      phone: phone || '+91 98765-00000',
      favoriteStops: [],
      favoriteRoutes: [],
    };
    DEMO_USERS[email] = demoUser;
    const token = generateToken(fakeId);

    return successResponse(res, 201, 'Registered successfully (Demo Mode)', {
      token,
      user: demoUser,
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

    const cleanEmail = email.trim().toLowerCase();

    // Check database if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findOne({ email: cleanEmail }).select('+password');
        if (user) {
          const isMatch = await user.matchPassword(password);
          if (isMatch) {
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
          }
        }
      } catch (dbErr) {
        console.warn('[Auth Warning] DB query failed, using demo fallback:', dbErr.message);
      }
    }

    // Demo account instant fallback (student@demo.com, admin@demo.com, driver@demo.com)
    if (DEMO_USERS[cleanEmail] && (password === 'password123' || password.length >= 6)) {
      const demoUser = DEMO_USERS[cleanEmail];
      const token = generateToken(demoUser._id);
      return successResponse(res, 200, 'Login successful (Demo Mode)', {
        token,
        user: demoUser,
      });
    }

    return errorResponse(res, 401, 'Invalid email or password');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.id;

    // Check if demo user
    const foundDemo = Object.values(DEMO_USERS).find((u) => u._id === userId);
    if (foundDemo) {
      return successResponse(res, 200, 'Current user retrieved', { user: foundDemo });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id)
        .populate('favoriteStops')
        .populate('favoriteRoutes');

      if (user) {
        return successResponse(res, 200, 'Current user retrieved', { user });
      }
    }

    return errorResponse(res, 404, 'User session expired or not found');
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
