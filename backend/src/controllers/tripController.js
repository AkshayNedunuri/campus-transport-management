const Trip = require('../models/Trip');
const Shuttle = require('../models/Shuttle');
const Route = require('../models/Route');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all trips with filters
// @route   GET /api/trips
// @access  Public
const getTrips = async (req, res, next) => {
  try {
    const { route, shuttle, driver, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (route) query.route = route;
    if (shuttle) query.shuttle = shuttle;
    if (driver) query.driver = driver;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Trip.countDocuments(query);
    const trips = await Trip.find(query)
      .populate({
        path: 'route',
        populate: { path: 'stops' },
      })
      .populate('shuttle')
      .populate('driver', 'name phone email')
      .populate('currentStop')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    return successResponse(res, 200, 'Trips retrieved successfully', {
      trips,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search trips between stops
// @route   GET /api/trips/search
// @access  Public
const searchTrips = async (req, res, next) => {
  try {
    const { fromStop, toStop, date, time } = req.query;

    let matchingRouteIds = [];
    const routes = await Route.find({ active: true }).populate('stops');

    if (fromStop && toStop) {
      // Find routes that contain both stops
      const validRoutes = routes.filter((r) => {
        const stopIds = r.stops.map((s) => (s._id ? s._id.toString() : s.toString()));
        const fromIdx = stopIds.indexOf(fromStop);
        const toIdx = stopIds.indexOf(toStop);
        return fromIdx !== -1 && toIdx !== -1;
      });
      matchingRouteIds = validRoutes.map((r) => r._id);
    } else if (fromStop) {
      const validRoutes = routes.filter((r) =>
        r.stops.some((s) => (s._id ? s._id.toString() : s.toString()) === fromStop)
      );
      matchingRouteIds = validRoutes.map((r) => r._id);
    } else if (toStop) {
      const validRoutes = routes.filter((r) =>
        r.stops.some((s) => (s._id ? s._id.toString() : s.toString()) === toStop)
      );
      matchingRouteIds = validRoutes.map((r) => r._id);
    }

    const tripQuery = {
      status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
    };

    if (matchingRouteIds.length > 0) {
      tripQuery.route = { $in: matchingRouteIds };
    }

    const trips = await Trip.find(tripQuery)
      .populate({
        path: 'route',
        populate: { path: 'stops' },
      })
      .populate({
        path: 'shuttle',
        populate: { path: 'driver', select: 'name phone' },
      })
      .populate('driver', 'name phone')
      .populate('currentStop')
      .sort({ startTime: 1 });

    // Also retrieve real-time live shuttles
    const shuttleQuery = { status: { $in: ['ACTIVE', 'INACTIVE', 'DELAYED', 'OFF_DUTY'] } };
    if (matchingRouteIds.length > 0) {
      shuttleQuery.assignedRoute = { $in: matchingRouteIds };
    }
    const liveShuttles = await Shuttle.find(shuttleQuery)
      .populate({
        path: 'assignedRoute',
        populate: { path: 'stops' },
      })
      .populate('driver', 'name phone email');

    return successResponse(res, 200, 'Trip search results', {
      trips,
      liveShuttles,
      matchingRoutesCount: matchingRouteIds.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Public
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate({
        path: 'route',
        populate: { path: 'stops' },
      })
      .populate('shuttle')
      .populate('driver', 'name phone email')
      .populate('currentStop');

    if (!trip) {
      return errorResponse(res, 404, 'Trip not found');
    }

    return successResponse(res, 200, 'Trip retrieved successfully', { trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private/Admin
const createTrip = async (req, res, next) => {
  try {
    const { route, shuttle, driver, startTime, expectedEndTime, passengerCount } = req.body;

    const trip = await Trip.create({
      route,
      shuttle,
      driver,
      startTime: startTime || new Date(),
      expectedEndTime: expectedEndTime || new Date(Date.now() + 30 * 60000),
      passengerCount: passengerCount || 0,
      status: 'SCHEDULED',
    });

    const populated = await Trip.findById(trip._id)
      .populate({
        path: 'route',
        populate: { path: 'stops' },
      })
      .populate('shuttle')
      .populate('driver', 'name phone');

    return successResponse(res, 201, 'Trip created successfully', { trip: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'route',
        populate: { path: 'stops' },
      })
      .populate('shuttle')
      .populate('driver', 'name phone');

    if (!trip) {
      return errorResponse(res, 404, 'Trip not found');
    }

    return successResponse(res, 200, 'Trip updated successfully', { trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Start trip
// @route   PUT /api/trips/:id/start
// @access  Private/Driver or Admin
const startTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return errorResponse(res, 404, 'Trip not found');
    }

    trip.status = 'IN_PROGRESS';
    trip.actualStartTime = new Date();
    await trip.save();

    // Set shuttle status to ACTIVE and link route
    if (trip.shuttle) {
      await Shuttle.findByIdAndUpdate(trip.shuttle, {
        status: 'ACTIVE',
        assignedRoute: trip.route,
      });
    }

    const populated = await Trip.findById(trip._id)
      .populate({
        path: 'route',
        populate: { path: 'stops' },
      })
      .populate('shuttle')
      .populate('driver', 'name phone');

    return successResponse(res, 200, 'Trip started successfully', { trip: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    End trip
// @route   PUT /api/trips/:id/end
// @access  Private/Driver or Admin
const endTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return errorResponse(res, 404, 'Trip not found');
    }

    trip.status = 'COMPLETED';
    trip.actualEndTime = new Date();
    await trip.save();

    if (trip.shuttle) {
      await Shuttle.findByIdAndUpdate(trip.shuttle, {
        status: 'INACTIVE',
      });
    }

    const populated = await Trip.findById(trip._id)
      .populate({
        path: 'route',
        populate: { path: 'stops' },
      })
      .populate('shuttle')
      .populate('driver', 'name phone');

    return successResponse(res, 200, 'Trip ended successfully', { trip: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private/Admin
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return errorResponse(res, 404, 'Trip not found');
    }
    return successResponse(res, 200, 'Trip deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrips,
  searchTrips,
  getTripById,
  createTrip,
  updateTrip,
  startTrip,
  endTrip,
  deleteTrip,
};
