const Shuttle = require('../models/Shuttle');
const ShuttleLocation = require('../models/ShuttleLocation');
const simulationService = require('../services/simulationService');
const { calculateETA } = require('../services/etaService');

function setupSockets(io) {
  // Give simulation service access to io
  simulationService.setIO(io);

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Send current simulation and LPU official schedule status to connected client
    socket.emit('simulation:status', simulationService.getStatus());
    socket.emit('schedule:status', simulationService.getScheduleStatus());

    // Join room for specific route
    socket.on('join:route', (routeId) => {
      if (routeId) {
        socket.join(`route:${routeId}`);
        console.log(`[Socket.IO] ${socket.id} joined route:${routeId}`);
      }
    });

    socket.on('leave:route', (routeId) => {
      if (routeId) {
        socket.leave(`route:${routeId}`);
      }
    });

    // Join room for specific shuttle
    socket.on('join:shuttle', (shuttleId) => {
      if (shuttleId) {
        socket.join(`shuttle:${shuttleId}`);
      }
    });

    socket.on('leave:shuttle', (shuttleId) => {
      if (shuttleId) {
        socket.leave(`shuttle:${shuttleId}`);
      }
    });

    // Driver sends live location
    socket.on('driver:location:update', async (data) => {
      try {
        const { shuttleId, latitude, longitude, speed, heading, nextStopLocation } = data;

        if (!shuttleId || latitude == null || longitude == null) return;

        const shuttle = await Shuttle.findById(shuttleId).populate('assignedRoute');
        if (!shuttle) return;

        shuttle.currentLocation = {
          latitude,
          longitude,
          speed: speed || 0,
          heading: heading || 0,
          lastUpdated: new Date(),
        };
        shuttle.lastUpdated = new Date();
        shuttle.status = 'ACTIVE';
        await shuttle.save();

        // Save history in ShuttleLocation
        await ShuttleLocation.create({
          shuttle: shuttle._id,
          latitude,
          longitude,
          speed: speed || 0,
          heading: heading || 0,
        });

        // Compute ETA if next stop is provided
        let eta = '3 min';
        let etaMinutes = 3;
        if (nextStopLocation) {
          const etaCalc = calculateETA(
            { latitude, longitude, speed },
            nextStopLocation,
            speed || 20
          );
          eta = etaCalc.formattedText;
          etaMinutes = etaCalc.minutes;
        }

        const updatePayload = {
          shuttleId: shuttle._id,
          shuttleNumber: shuttle.shuttleNumber,
          latitude,
          longitude,
          speed: speed || 0,
          heading: heading || 0,
          currentPassengerCount: shuttle.currentPassengerCount,
          capacity: shuttle.capacity,
          occupancyPercentage: shuttle.occupancyPercentage,
          occupancyStatus: shuttle.occupancyStatus,
          status: shuttle.status,
          eta,
          etaMinutes,
          assignedRoute: shuttle.assignedRoute,
          lastUpdated: shuttle.lastUpdated,
          isSimulated: false,
        };

        // Broadcast to general listeners & route room
        io.emit('shuttle:location:update', updatePayload);
        if (shuttle.assignedRoute) {
          io.to(`route:${shuttle.assignedRoute._id || shuttle.assignedRoute}`).emit(
            'shuttle:location:update',
            updatePayload
          );
        }
      } catch (err) {
        console.error('[Socket.IO] Error handling driver:location:update:', err.message);
      }
    });

    // Driver updates passenger count
    socket.on('driver:passenger:update', async (data) => {
      try {
        const { shuttleId, passengerCount } = data;
        if (!shuttleId || passengerCount == null) return;

        const shuttle = await Shuttle.findById(shuttleId);
        if (!shuttle) return;

        shuttle.currentPassengerCount = Math.max(0, Math.min(shuttle.capacity, passengerCount));
        shuttle.lastUpdated = new Date();
        await shuttle.save();

        const payload = {
          shuttleId: shuttle._id,
          shuttleNumber: shuttle.shuttleNumber,
          currentPassengerCount: shuttle.currentPassengerCount,
          capacity: shuttle.capacity,
          occupancyPercentage: shuttle.occupancyPercentage,
          occupancyStatus: shuttle.occupancyStatus,
        };

        io.emit('shuttle:passenger:update', payload);
      } catch (err) {
        console.error('[Socket.IO] Error updating passenger count:', err.message);
      }
    });

    // Toggle simulation mode from client
    socket.on('simulation:toggle', async (data) => {
      try {
        if (simulationService.isRunning) {
          simulationService.stop();
        } else {
          await simulationService.start();
        }
        io.emit('simulation:status', simulationService.getStatus());
      } catch (err) {
        console.error('[Socket.IO] Error toggling simulation:', err.message);
      }
    });

    // Toggle or set timing mode (OFFICIAL_SCHEDULE vs DEMO_OVERRIDE)
    socket.on('schedule:set-mode', (data) => {
      try {
        const mode = data?.mode;
        if (mode) {
          const updated = simulationService.setTimingMode(mode);
          io.emit('schedule:status', updated);
        }
      } catch (err) {
        console.error('[Socket.IO] Error setting timing mode:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSockets;
