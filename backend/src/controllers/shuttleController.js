const Shuttle = require('../models/Shuttle');
const ShuttleLocation = require('../models/ShuttleLocation');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get LPU official timing & schedule status
// @route   GET /api/shuttles/schedule-status
// @access  Public
const getScheduleStatus = async (req, res, next) => {
  try {
    const simulationService = require('../services/simulationService');
    const schedule = simulationService.getScheduleStatus();
    return successResponse(res, 200, 'Schedule status retrieved', { schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shuttles
// @route   GET /api/shuttles
// @access  Public
const getShuttles = async (req, res, next) => {
  try {
    const { status, route } = req.query;
    const query = {};

    if (status) query.status = status;
    if (route) query.assignedRoute = route;

    const shuttles = await Shuttle.find(query)
      .populate('driver', 'name phone email')
      .populate({
        path: 'assignedRoute',
        populate: { path: 'stops' },
      })
      .sort({ shuttleNumber: 1 });

    return successResponse(res, 200, 'Shuttles retrieved successfully', { shuttles });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shuttle
// @route   GET /api/shuttles/:id
// @access  Public
const getShuttleById = async (req, res, next) => {
  try {
    const shuttle = await Shuttle.findById(req.params.id)
      .populate('driver', 'name phone email')
      .populate({
        path: 'assignedRoute',
        populate: { path: 'stops' },
      });

    if (!shuttle) {
      return errorResponse(res, 404, 'Shuttle not found');
    }

    return successResponse(res, 200, 'Shuttle retrieved successfully', { shuttle });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new shuttle
// @route   POST /api/shuttles
// @access  Private/Admin
const createShuttle = async (req, res, next) => {
  try {
    const { shuttleNumber, registrationNumber, driver, capacity, assignedRoute, status } = req.body;

    const existing = await Shuttle.findOne({ shuttleNumber });
    if (existing) {
      return errorResponse(res, 400, 'Shuttle number already exists');
    }

    const shuttle = await Shuttle.create({
      shuttleNumber,
      registrationNumber,
      driver: driver || null,
      capacity: capacity || 50,
      assignedRoute: assignedRoute || null,
      status: status || 'INACTIVE',
      currentPassengerCount: 0,
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 0,
        heading: 0,
        lastUpdated: new Date(),
      },
    });

    const populated = await Shuttle.findById(shuttle._id)
      .populate('driver', 'name phone')
      .populate('assignedRoute');

    return successResponse(res, 201, 'Shuttle created successfully', { shuttle: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shuttle
// @route   PUT /api/shuttles/:id
// @access  Private/Admin
const updateShuttle = async (req, res, next) => {
  try {
    const shuttle = await Shuttle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('driver', 'name phone')
      .populate('assignedRoute');

    if (!shuttle) {
      return errorResponse(res, 404, 'Shuttle not found');
    }

    return successResponse(res, 200, 'Shuttle updated successfully', { shuttle });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shuttle
// @route   DELETE /api/shuttles/:id
// @access  Private/Admin
const deleteShuttle = async (req, res, next) => {
  try {
    const shuttle = await Shuttle.findByIdAndDelete(req.params.id);
    if (!shuttle) {
      return errorResponse(res, 404, 'Shuttle not found');
    }
    return successResponse(res, 200, 'Shuttle deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

// @desc    Update shuttle location
// @route   PUT /api/shuttles/:id/location
// @access  Private/Driver or Admin
const updateShuttleLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, speed = 0, heading = 0 } = req.body;

    if (latitude == null || longitude == null) {
      return errorResponse(res, 400, 'Latitude and longitude are required');
    }

    const shuttle = await Shuttle.findById(req.params.id);
    if (!shuttle) {
      return errorResponse(res, 404, 'Shuttle not found');
    }

    shuttle.currentLocation = {
      latitude,
      longitude,
      speed,
      heading,
      lastUpdated: new Date(),
    };
    shuttle.lastUpdated = new Date();
    await shuttle.save();

    await ShuttleLocation.create({
      shuttle: shuttle._id,
      latitude,
      longitude,
      speed,
      heading,
    });

    return successResponse(res, 200, 'Shuttle location updated successfully', {
      currentLocation: shuttle.currentLocation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shuttle status & passenger count
// @route   PUT /api/shuttles/:id/status
// @access  Private/Driver or Admin
const updateShuttleStatus = async (req, res, next) => {
  try {
    const { status, currentPassengerCount } = req.body;
    const shuttle = await Shuttle.findById(req.params.id);

    if (!shuttle) {
      return errorResponse(res, 404, 'Shuttle not found');
    }

    if (status) shuttle.status = status;
    if (currentPassengerCount !== undefined) {
      shuttle.currentPassengerCount = Math.max(0, Math.min(shuttle.capacity, currentPassengerCount));
    }
    shuttle.lastUpdated = new Date();
    await shuttle.save();

    return successResponse(res, 200, 'Shuttle status updated successfully', { shuttle });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getScheduleStatus,
  getShuttles,
  getShuttleById,
  createShuttle,
  updateShuttle,
  deleteShuttle,
  updateShuttleLocation,
  updateShuttleStatus,
};
