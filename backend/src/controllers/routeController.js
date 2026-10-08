const Route = require('../models/Route');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getRoutes = async (req, res, next) => {
  try {
    const { active, search } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === 'true';
    }

    if (search) {
      query.$or = [
        { routeName: { $regex: search, $options: 'i' } },
        { routeNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const routes = await Route.find(query).populate('stops').sort({ routeNumber: 1 });
    return successResponse(res, 200, 'Routes retrieved successfully', { routes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single route by ID
// @route   GET /api/routes/:id
// @access  Public
const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id).populate('stops');
    if (!route) {
      return errorResponse(res, 404, 'Route not found');
    }
    return successResponse(res, 200, 'Route retrieved successfully', { route });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Private/Admin
const createRoute = async (req, res, next) => {
  try {
    const { routeName, routeNumber, description, stops, estimatedDuration, active, operatingDays, color } = req.body;

    const existing = await Route.findOne({ routeNumber });
    if (existing) {
      return errorResponse(res, 400, 'Route with this number already exists');
    }

    const route = await Route.create({
      routeName,
      routeNumber,
      description,
      stops: stops || [],
      estimatedDuration: estimatedDuration || 20,
      active: active !== undefined ? active : true,
      operatingDays: operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      color: color || '#4f46e5',
    });

    const populatedRoute = await Route.findById(route._id).populate('stops');
    return successResponse(res, 201, 'Route created successfully', { route: populatedRoute });
  } catch (error) {
    next(error);
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private/Admin
const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('stops');

    if (!route) {
      return errorResponse(res, 404, 'Route not found');
    }

    return successResponse(res, 200, 'Route updated successfully', { route });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return errorResponse(res, 404, 'Route not found');
    }
    return successResponse(res, 200, 'Route deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
};
