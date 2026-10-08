const Stop = require('../models/Stop');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all campus stops
// @route   GET /api/stops
// @access  Public
const getStops = async (req, res, next) => {
  try {
    const { active, search } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const stops = await Stop.find(query).sort({ name: 1 });
    return successResponse(res, 200, 'Stops retrieved successfully', { stops });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stop by ID
// @route   GET /api/stops/:id
// @access  Public
const getStopById = async (req, res, next) => {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return errorResponse(res, 404, 'Stop not found');
    }
    return successResponse(res, 200, 'Stop retrieved successfully', { stop });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new stop
// @route   POST /api/stops
// @access  Private/Admin
const createStop = async (req, res, next) => {
  try {
    const { name, code, latitude, longitude, description, facilities, active } = req.body;

    const existing = await Stop.findOne({ code: code.toUpperCase() });
    if (existing) {
      return errorResponse(res, 400, 'Stop with this code already exists');
    }

    const stop = await Stop.create({
      name,
      code: code.toUpperCase(),
      latitude,
      longitude,
      description,
      facilities: facilities || ['Shelter', 'Bench', 'Lighting'],
      active: active !== undefined ? active : true,
    });

    return successResponse(res, 201, 'Stop created successfully', { stop });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stop
// @route   PUT /api/stops/:id
// @access  Private/Admin
const updateStop = async (req, res, next) => {
  try {
    const stop = await Stop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!stop) {
      return errorResponse(res, 404, 'Stop not found');
    }

    return successResponse(res, 200, 'Stop updated successfully', { stop });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete stop
// @route   DELETE /api/stops/:id
// @access  Private/Admin
const deleteStop = async (req, res, next) => {
  try {
    const stop = await Stop.findByIdAndDelete(req.params.id);
    if (!stop) {
      return errorResponse(res, 404, 'Stop not found');
    }
    return successResponse(res, 200, 'Stop deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
};
