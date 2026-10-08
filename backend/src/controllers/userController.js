const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all users with search, role filter, and pagination
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return successResponse(res, 200, 'Users retrieved successfully', {
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('favoriteStops')
      .populate('favoriteRoutes');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (admin)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse(res, 400, 'User with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password: password || 'password123',
      role: role || 'student',
      studentId,
      phone,
    });

    return successResponse(res, 201, 'User created successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res, next) => {
  try {
    // Only admin or user themselves can update
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return errorResponse(res, 403, 'Not authorized to update this profile');
    }

    const fieldsToUpdate = {};
    const allowedFields = ['name', 'phone', 'studentId', 'profileImage'];
    if (req.user.role === 'admin') {
      allowedFields.push('role', 'email');
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    if (req.body.password) {
      const user = await User.findById(req.params.id);
      if (user) {
        user.password = req.body.password;
        Object.assign(user, fieldsToUpdate);
        await user.save();
        return successResponse(res, 200, 'User updated successfully', { user });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite route
// @route   POST /api/users/favorites/route/:routeId
// @access  Private
const toggleFavoriteRoute = async (req, res, next) => {
  try {
    const { routeId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.favoriteRoutes.indexOf(routeId);
    if (index > -1) {
      user.favoriteRoutes.splice(index, 1);
    } else {
      user.favoriteRoutes.push(routeId);
    }

    await user.save();
    return successResponse(res, 200, 'Favorite route toggled', {
      favoriteRoutes: user.favoriteRoutes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite stop
// @route   POST /api/users/favorites/stop/:stopId
// @access  Private
const toggleFavoriteStop = async (req, res, next) => {
  try {
    const { stopId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.favoriteStops.indexOf(stopId);
    if (index > -1) {
      user.favoriteStops.splice(index, 1);
    } else {
      user.favoriteStops.push(stopId);
    }

    await user.save();
    return successResponse(res, 200, 'Favorite stop toggled', {
      favoriteStops: user.favoriteStops,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleFavoriteRoute,
  toggleFavoriteStop,
};
