const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_campus_transport_jwt_key_2026', {
    expiresIn: '7d',
  });
};

// Race a promise against a timeout — DB never hangs more than `ms` milliseconds
const withTimeout = (promise, ms = 8000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`DB timed out after ${ms}ms`)), ms)
    ),
  ]);

// Fallback demo accounts for instant live evaluation when DB is pending or unreachable
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

    const cleanEmail = email.trim().toLowerCase();

    // Try DB first with 8s timeout to accommodate Atlas latency
    const existingUser = await withTimeout(User.findOne({ email: cleanEmail }), 8000);
    if (existingUser) {
      return errorResponse(res, 400, 'An account with this email already exists');
    }

    const user = await withTimeout(
      User.create({
        name,
        email: cleanEmail,
        password,
        role: role || 'student',
        studentId: studentId || '',
        phone: phone || '',
      }),
      8000
    );

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
        favoriteStops: user.favoriteStops || [],
        favoriteRoutes: user.favoriteRoutes || [],
      },
    });
  } catch (dbErr) {
    if (dbErr.message && dbErr.message.includes('timed out')) {
      return errorResponse(res, 503, 'Database temporarily unavailable. Please try again in a moment.');
    }
    next(dbErr);
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

    // 1. Fixed demo accounts — require EXACT password 'password123'
    if (DEMO_USERS[cleanEmail]) {
      if (password !== 'password123') {
        return errorResponse(res, 401, 'Invalid email or password');
      }
      const demoUser = DEMO_USERS[cleanEmail];
      const token = generateToken(demoUser._id);
      return successResponse(res, 200, 'Login successful', { token, user: demoUser });
    }

    // 2. Try real DB (8s timeout) — real users MUST have correct password
    try {
      const user = await withTimeout(User.findOne({ email: cleanEmail }).select('+password'), 8000);
      if (user) {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return errorResponse(res, 401, 'Invalid email or password');
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
            favoriteStops: user.favoriteStops || [],
            favoriteRoutes: user.favoriteRoutes || [],
          },
        });
      }
    } catch (dbErr) {
      console.error('[Login] DB error:', dbErr.message);
      return errorResponse(res, 503, 'Database temporarily unavailable. Please try again.');
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

    // Demo user — no DB needed
    const foundDemo = Object.values(DEMO_USERS).find((u) => u._id === userId);
    if (foundDemo) {
      return successResponse(res, 200, 'Current user retrieved', { user: foundDemo });
    }

    // Try real DB (8s timeout)
    try {
      const user = await withTimeout(
        User.findById(req.user._id).populate('favoriteStops').populate('favoriteRoutes'),
        8000
      );
      if (user) {
        return successResponse(res, 200, 'Current user retrieved', { user });
      }
    } catch (dbErr) {
      console.warn('[GetMe] DB unavailable:', dbErr.message);
    }

    // Return the token-decoded user info as fallback
    return successResponse(res, 200, 'Current user retrieved', { user: req.user });
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
