const mongoose = require('mongoose');
const Shuttle = require('../models/Shuttle');
const ShuttleLocation = require('../models/ShuttleLocation');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const { calculateETA } = require('./etaService');

// Realistic Lovely Professional University (LPU) campus waypoints for simulated loop
// Covers North, South, East, West sectors, Hostels BH 1-12 & GH 1-9, Blocks 1-60
const campusWaypoints = [
  { lat: 31.2558, lng: 75.7033, name: 'Gate 1 – Main Entrance (GT Road / NH-44)' },
  { lat: 31.2550, lng: 75.7018, name: 'Block 13 & 14 (Design, Architecture & Arts)' },
  { lat: 31.2540, lng: 75.7015, name: 'Gate 4 – Transport Terminal & Bus Bay' },
  { lat: 31.2520, lng: 75.7022, name: 'Block 25 to 29 (CSE & IT Complex)' },
  { lat: 31.2527, lng: 75.7016, name: 'Block 60 (School of Law & Legal Studies)' },
  { lat: 31.2543, lng: 75.7026, name: 'Block 40 & 41 (Mittal School of Business)' },
  { lat: 31.2533, lng: 75.7028, name: 'Central Library – Block 36 & 37' },
  { lat: 31.2538, lng: 75.7035, name: 'Uni-Mall & Multi-Cuisine Food Court' },
  { lat: 31.2530, lng: 75.7042, name: 'Baldev Raj Mittal Unipolis' },
  { lat: 31.2545, lng: 75.7040, name: 'Block 38 (ECE & Robotics Lab)' },
  { lat: 31.2568, lng: 75.7040, name: 'Girls Hostel GH-1 & GH-2' },
  { lat: 31.2578, lng: 75.7047, name: 'Girls Hostel GH-3 & GH-4' },
  { lat: 31.2585, lng: 75.7054, name: 'Girls Hostel GH-5 & GH-6' },
  { lat: 31.2592, lng: 75.7060, name: 'Girls Hostel GH-7 & North Tower' },
  { lat: 31.2598, lng: 75.7066, name: 'Girls Hostel GH-8 & GH-9 / Apartments' },
  { lat: 31.2565, lng: 75.7058, name: 'Uni-Hospital & Medical Centre (Block 2 & 3)' },
  { lat: 31.2535, lng: 75.7062, name: 'School of Agriculture (Block 18)' },
  { lat: 31.2525, lng: 75.7055, name: 'Shanti Devi Mittal Auditorium' },
  { lat: 31.2510, lng: 75.7050, name: 'Block 55, 56 & 57 (Pharmacy & BioTech)' },
  { lat: 31.2518, lng: 75.7068, name: 'Boys Hostel BH-1 & BH-2' },
  { lat: 31.2503, lng: 75.7063, name: 'Boys Hostel BH-3 & BH-4' },
  { lat: 31.2490, lng: 75.7072, name: 'Boys Hostel BH-5 & BH-6' },
  { lat: 31.2478, lng: 75.7080, name: 'Boys Hostel BH-7 & BH-8' },
  { lat: 31.2466, lng: 75.7086, name: 'Boys Hostel BH-9 (South Wing)' },
  { lat: 31.2458, lng: 75.7090, name: 'Boys Hostel BH-10 (New South Tower)' },
  { lat: 31.2450, lng: 75.7095, name: 'Boys Hostel BH-11 (New High-Rise)' },
  { lat: 31.2442, lng: 75.7100, name: 'Boys Hostel BH-12 (South Residential Hub)' },
  { lat: 31.2483, lng: 75.7038, name: 'Olympic Sports Complex & Stadium' },
  { lat: 31.2460, lng: 75.7068, name: 'Agriculture Research Farms & Greenhouses' },
];

// Inner Quad waypoints for Electric Buggy Train (Only runs in central core during daytime)
const innerQuadWaypoints = [
  { lat: 31.2530, lng: 75.7042, name: 'Baldev Raj Mittal Unipolis' },
  { lat: 31.2548, lng: 75.7038, name: 'Block 1 (Admin & Registrar)' },
  { lat: 31.2538, lng: 75.7035, name: 'Uni-Mall & Food Court' },
  { lat: 31.2533, lng: 75.7028, name: 'Central Library (Block 37)' },
  { lat: 31.2520, lng: 75.7022, name: 'Block 25-29 (CSE & IT)' },
  { lat: 31.2545, lng: 75.7040, name: 'Block 38 (ECE & Robotics)' },
];

// LPU Gate 4 Transport Depot (where off-duty shuttles park)
const LPU_DEPOT = {
  lat: 31.2540,
  lng: 75.7015,
  name: 'Gate 4 Transport Terminal & Central Depot',
};

// Official fleet category operating schedules
const FLEET_SCHEDULES = {
  BUGGY_TRAIN: {
    categoryKey: 'BUGGY_TRAIN',
    name: 'Campus Electric Buggy Train (LPU Mini-Train)',
    type: 'Buggy Train',
    prefix: 'LPU-BuggyTrain',
    window: '08:30 AM - 06:00 PM IST',
    startHour: 8,
    startMin: 30,
    endHour: 18,
    endMin: 0,
    description: 'Daytime multi-coach electric buggy chain for academic quad hops between Library, CSE, Mall & Unipolis. Off-duty during evenings & nights.',
  },
  AC_BUS: {
    categoryKey: 'AC_BUS',
    name: 'Campus Express (Large AC Buses)',
    type: 'Large AC Bus',
    prefix: 'LPU-Shuttle',
    window: '07:00 AM - 08:00 PM IST',
    startHour: 7,
    startMin: 0,
    endHour: 20,
    endMin: 0,
    description: 'High-capacity 50-seater arterial buses connecting Gate 1, Gate 4, Academic Blocks and Hostels.',
  },
  MINI_BUS: {
    categoryKey: 'MINI_BUS',
    name: 'Campus Feeder (Mini Buses)',
    type: 'Mini Bus',
    prefix: 'LPU-Mini',
    window: '07:30 AM - 08:30 PM IST',
    startHour: 7,
    startMin: 30,
    endHour: 20,
    endMin: 30,
    description: 'Agile 35-seater feeder buses connecting departments, sports arena, agriculture plots and hostel clusters.',
  },
  E_RICKSHAW: {
    categoryKey: 'E_RICKSHAW',
    name: 'Hostel Hop (E-Rickshaws)',
    type: 'E-Rickshaw',
    prefix: 'LPU-ERick',
    window: '06:30 AM - 10:00 PM IST',
    startHour: 6,
    startMin: 30,
    endHour: 22,
    endMin: 0,
    description: 'High-frequency 6-seater electric rickshaws for quick transit between hostel gates, Uni-Mall and campus exits.',
  },
  NIGHT_SHUTTLE: {
    categoryKey: 'NIGHT_SHUTTLE',
    name: 'Night Safety Shuttles',
    type: 'Night Safety Bus',
    prefix: 'LPU-Night',
    window: '08:00 PM - 11:00 PM IST',
    startHour: 20,
    startMin: 0,
    endHour: 23,
    endMin: 0,
    description: 'Dedicated night perimeter buses connecting all hostel blocks, Uni-Hospital, and Gate 1 with campus security.',
  },
};

// Fallback memory fleet when DB connection is initialising or pending IP whitelist
const FALLBACK_FLEET = [
  { _id: 'mem_shuttle_101', shuttleNumber: 'LPU-Shuttle-101', capacity: 50, categoryKey: 'AC_BUS', routeName: 'Campus Express Loop' },
  { _id: 'mem_shuttle_102', shuttleNumber: 'LPU-Shuttle-102', capacity: 50, categoryKey: 'AC_BUS', routeName: 'Academic Quad Rapid' },
  { _id: 'mem_mini_201', shuttleNumber: 'LPU-Mini-201', capacity: 35, categoryKey: 'MINI_BUS', routeName: 'Boys Hostels BH Loop' },
  { _id: 'mem_mini_202', shuttleNumber: 'LPU-Mini-202', capacity: 35, categoryKey: 'MINI_BUS', routeName: 'Girls Hostels GH Direct' },
  { _id: 'mem_train_501', shuttleNumber: 'LPU-BuggyTrain-501', capacity: 8, categoryKey: 'BUGGY_TRAIN', routeName: 'Electric Buggy Train' },
  { _id: 'mem_train_502', shuttleNumber: 'LPU-BuggyTrain-502', capacity: 8, categoryKey: 'BUGGY_TRAIN', routeName: 'Electric Buggy Train' },
  { _id: 'mem_erick_301', shuttleNumber: 'LPU-ERick-301', capacity: 6, categoryKey: 'E_RICKSHAW', routeName: 'Hostel Hop E-Rickshaw' },
  { _id: 'mem_night_401', shuttleNumber: 'LPU-Night-401', capacity: 50, categoryKey: 'NIGHT_SHUTTLE', routeName: 'Night Owl Safety' },
];

function getVehicleCategory(shuttleNumber = '') {
  if (shuttleNumber.includes('BuggyTrain') || shuttleNumber.includes('Train') || shuttleNumber.includes('BT')) {
    return FLEET_SCHEDULES.BUGGY_TRAIN;
  }
  if (shuttleNumber.includes('Mini') || shuttleNumber.includes('LM')) {
    return FLEET_SCHEDULES.MINI_BUS;
  }
  if (shuttleNumber.includes('ERick') || shuttleNumber.includes('ER')) {
    return FLEET_SCHEDULES.E_RICKSHAW;
  }
  if (shuttleNumber.includes('Night') || shuttleNumber.includes('LN')) {
    return FLEET_SCHEDULES.NIGHT_SHUTTLE;
  }
  return FLEET_SCHEDULES.AC_BUS;
}

function isCategoryActiveNow(category, istDate) {
  const currentMinutes = istDate.getHours() * 60 + istDate.getMinutes();
  const startMinutes = category.startHour * 60 + category.startMin;
  const endMinutes = category.endHour * 60 + category.endMin;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

class SimulationService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.shuttleIndices = {}; // shuttleId -> current waypoint index
    this.io = null;
    // 'OFFICIAL_SCHEDULE' = strictly follows real LPU vehicle category timetables
    // 'DEMO_OVERRIDE' = simulates all vehicles active 24/7 for evaluation
    this.timingMode = 'OFFICIAL_SCHEDULE';
  }

  setIO(ioInstance) {
    this.io = ioInstance;
  }

  getWaypoints() {
    return campusWaypoints;
  }

  getScheduleStatus() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istDate = new Date(utc + 3600000 * 5.5);

    const timeStringIST = istDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const fleetOverview = Object.values(FLEET_SCHEDULES).map((cat) => {
      const active = isCategoryActiveNow(cat, istDate);
      return {
        categoryKey: cat.categoryKey,
        name: cat.name,
        type: cat.type,
        window: cat.window,
        isActive: this.timingMode === 'DEMO_OVERRIDE' ? true : active,
        statusText: (this.timingMode === 'DEMO_OVERRIDE' || active) ? 'OPERATIONAL' : 'OFF_DUTY / CLOSED',
        description: cat.description,
      };
    });

    const currentMinutes = istDate.getHours() * 60 + istDate.getMinutes();
    const isOverallCampusOpen = currentMinutes >= 6 * 60 + 30 && currentMinutes <= 23 * 60;

    return {
      isWithinOperatingHours: isOverallCampusOpen,
      isEffectivelyActive: this.timingMode === 'DEMO_OVERRIDE' || isOverallCampusOpen,
      timingMode: this.timingMode,
      currentTimeIST: timeStringIST,
      operatingWindow: '06:30 AM - 11:00 PM IST (Fleet Specific)',
      statusTitle: isOverallCampusOpen ? 'LPU Transit Fleet Active' : 'Campus Transit Closed (Night Hours)',
      statusMessage: isOverallCampusOpen
        ? 'Campus transit is operational according to vehicle category schedules.'
        : 'General transit service is closed for the night. Emergency medical on-call available 24/7.',
      categories: fleetOverview,
      depot: LPU_DEPOT,
      emergencyNightContact: '+91 1824-517000 (Uni-Hospital 24/7 Ambulance)',
    };
  }

  setTimingMode(newMode) {
    if (newMode === 'DEMO_OVERRIDE' || newMode === 'OFFICIAL_SCHEDULE') {
      this.timingMode = newMode;
      const status = this.getScheduleStatus();
      if (this.io) {
        this.io.emit('schedule:status', status);
      }
      return status;
    }
    return this.getScheduleStatus();
  }

  getStatus() {
    const schedule = this.getScheduleStatus();
    return {
      isRunning: this.isRunning,
      activeShuttlesCount: Object.keys(this.shuttleIndices).length,
      mode: this.timingMode,
      schedule,
    };
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('[Simulation Service] LPU GPS multi-fleet simulation started.');

    if (mongoose.connection.readyState === 1) {
      try {
        const shuttles = await Shuttle.find({}).limit(40);
        shuttles.forEach((s, idx) => {
          const isTrain = s.shuttleNumber.includes('BuggyTrain');
          const waypoints = isTrain ? innerQuadWaypoints : campusWaypoints;
          this.shuttleIndices[s._id.toString()] = (idx * 2) % waypoints.length;
        });
      } catch (e) {
        console.error('[Simulation Service] Error fetching initial shuttles:', e.message);
      }
    } else {
      FALLBACK_FLEET.forEach((s, idx) => {
        const isTrain = s.shuttleNumber.includes('BuggyTrain');
        const waypoints = isTrain ? innerQuadWaypoints : campusWaypoints;
        this.shuttleIndices[s._id] = (idx * 3) % waypoints.length;
      });
    }

    if (this.io) {
      this.io.emit('simulation:status', { isRunning: true });
    }

    // Tick every 3.5 seconds
    this.intervalId = setInterval(async () => {
      await this.tick();
    }, 3500);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[Simulation Service] LPU GPS simulation stopped.');
    if (this.io) {
      this.io.emit('simulation:status', { isRunning: false });
    }
  }

  emitInMemorySimulation(schedule, istDate) {
    for (const shuttle of FALLBACK_FLEET) {
      const id = shuttle._id;
      const cat = getVehicleCategory(shuttle.shuttleNumber);
      const isCatActive = isCategoryActiveNow(cat, istDate);
      const shouldRun = this.timingMode === 'DEMO_OVERRIDE' || isCatActive;

      const isTrain = cat.categoryKey === 'BUGGY_TRAIN';
      const routeWaypoints = isTrain ? innerQuadWaypoints : campusWaypoints;

      let currentIndex = this.shuttleIndices[id] || 0;
      let nextIndex = (currentIndex + 1) % routeWaypoints.length;
      this.shuttleIndices[id] = nextIndex;

      const nextPt = routeWaypoints[nextIndex];

      if (!shouldRun) {
        const offDutyPayload = {
          shuttleId: shuttle._id,
          shuttleNumber: shuttle.shuttleNumber,
          category: cat.type,
          categoryKey: cat.categoryKey,
          latitude: LPU_DEPOT.lat,
          longitude: LPU_DEPOT.lng,
          speed: 0,
          heading: 0,
          currentPassengerCount: 0,
          capacity: shuttle.capacity,
          occupancyPercentage: 0,
          occupancyStatus: { label: 'Off-Duty', color: 'slate', code: 'OFF_DUTY' },
          status: 'OFF_DUTY',
          nextStopName: `Closed for Day (Operating Hours: ${cat.window})`,
          eta: `Resumes ${cat.window.split('-')[0].trim()}`,
          etaMinutes: null,
          assignedRoute: { routeName: shuttle.routeName },
          isSimulated: true,
          operatingWindow: cat.window,
        };
        if (this.io) this.io.emit('shuttle:location:update', offDutyPayload);
        continue;
      }

      const jitterLat = (Math.random() - 0.5) * 0.00012;
      const jitterLng = (Math.random() - 0.5) * 0.00012;
      const newLat = parseFloat((nextPt.lat + jitterLat).toFixed(6));
      const newLng = parseFloat((nextPt.lng + jitterLng).toFixed(6));
      const simulatedSpeed = isTrain ? 14 : 22;

      const updatePayload = {
        shuttleId: shuttle._id,
        shuttleNumber: shuttle.shuttleNumber,
        category: cat.type,
        categoryKey: cat.categoryKey,
        latitude: newLat,
        longitude: newLng,
        speed: simulatedSpeed,
        heading: 90,
        currentPassengerCount: Math.floor(shuttle.capacity * 0.6),
        capacity: shuttle.capacity,
        occupancyPercentage: 60,
        occupancyStatus: { label: 'Moderate', color: 'yellow', code: 'MODERATE' },
        status: 'ACTIVE',
        nextStopName: nextPt.name,
        eta: '3 mins',
        etaMinutes: 3,
        assignedRoute: { routeName: shuttle.routeName },
        isSimulated: true,
        operatingWindow: cat.window,
      };

      if (this.io) this.io.emit('shuttle:location:update', updatePayload);
    }
  }

  async tick() {
    try {
      const schedule = this.getScheduleStatus();
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utc + 3600000 * 5.5);

      // If database connection is not established, stream in-memory fallback vehicles smoothly
      if (mongoose.connection.readyState !== 1) {
        this.emitInMemorySimulation(schedule, istDate);
        if (this.io) this.io.emit('schedule:status', schedule);
        return;
      }

      const shuttles = await Shuttle.find({})
        .populate('assignedRoute')
        .populate('driver', 'name phone');

      if (!shuttles || shuttles.length === 0) {
        this.emitInMemorySimulation(schedule, istDate);
        if (this.io) this.io.emit('schedule:status', schedule);
        return;
      }

      for (const shuttle of shuttles) {
        const id = shuttle._id.toString();
        const cat = getVehicleCategory(shuttle.shuttleNumber);
        const isCatActive = isCategoryActiveNow(cat, istDate);
        const shouldRun = this.timingMode === 'DEMO_OVERRIDE' || isCatActive;

        const isTrain = cat.categoryKey === 'BUGGY_TRAIN';
        const routeWaypoints = isTrain ? innerQuadWaypoints : campusWaypoints;

        if (!shouldRun) {
          // Off-duty vehicle parked at depot
          shuttle.currentLocation = {
            latitude: LPU_DEPOT.lat + ((Math.random() - 0.5) * 0.0002),
            longitude: LPU_DEPOT.lng + ((Math.random() - 0.5) * 0.0002),
            speed: 0,
            heading: 0,
            lastUpdated: new Date(),
          };
          shuttle.currentPassengerCount = 0;
          shuttle.status = 'OFF_DUTY';
          shuttle.lastUpdated = new Date();
          await shuttle.save();

          const offDutyPayload = {
            shuttleId: shuttle._id,
            shuttleNumber: shuttle.shuttleNumber,
            category: cat.type,
            categoryKey: cat.categoryKey,
            latitude: shuttle.currentLocation.latitude,
            longitude: shuttle.currentLocation.longitude,
            speed: 0,
            heading: 0,
            currentPassengerCount: 0,
            capacity: shuttle.capacity,
            occupancyPercentage: 0,
            occupancyStatus: { label: 'Off-Duty', color: 'slate', code: 'OFF_DUTY' },
            status: 'OFF_DUTY',
            nextStopName: `Closed for Day (Operating Hours: ${cat.window})`,
            eta: `Resumes ${cat.window.split('-')[0].trim()}`,
            etaMinutes: null,
            assignedRoute: shuttle.assignedRoute,
            driver: shuttle.driver,
            lastUpdated: new Date(),
            isSimulated: true,
            operatingWindow: cat.window,
          };

          if (this.io) {
            this.io.emit('shuttle:location:update', offDutyPayload);
          }
          continue;
        }

        // Active vehicle simulation
        let currentIndex = this.shuttleIndices[id] || 0;
        let nextIndex = (currentIndex + 1) % routeWaypoints.length;
        this.shuttleIndices[id] = nextIndex;

        const currentPt = routeWaypoints[currentIndex];
        const nextPt = routeWaypoints[nextIndex];

        // GPS jitter (+/- 0.00008)
        const jitterLat = (Math.random() - 0.5) * 0.00012;
        const jitterLng = (Math.random() - 0.5) * 0.00012;
        const newLat = parseFloat((nextPt.lat + jitterLat).toFixed(6));
        const newLng = parseFloat((nextPt.lng + jitterLng).toFixed(6));

        // Speed depending on vehicle type (Train: 12-16 km/h, Rickshaw: 14-20 km/h, Bus: 20-30 km/h)
        let baseSpeed = 22;
        if (isTrain) baseSpeed = 14;
        else if (cat.categoryKey === 'E_RICKSHAW') baseSpeed = 16;
        const simulatedSpeed = Math.floor(Math.random() * 8) + baseSpeed;

        // Heading calculation
        const y = Math.sin(nextPt.lng - currentPt.lng) * Math.cos(nextPt.lat);
        const x =
          Math.cos(currentPt.lat) * Math.sin(nextPt.lat) -
          Math.sin(currentPt.lat) * Math.cos(nextPt.lat) * Math.cos(nextPt.lng - currentPt.lng);
        let heading = (Math.atan2(y, x) * 180) / Math.PI;
        heading = Math.round((heading + 360) % 360);

        // Passengers fluctuation
        let passengers = shuttle.currentPassengerCount || Math.floor(shuttle.capacity * 0.5);
        const delta = Math.floor(Math.random() * 5) - 2;
        passengers = Math.max(1, Math.min(shuttle.capacity, passengers + delta));

        // ETA calculation
        const etaObj = calculateETA(
          { latitude: newLat, longitude: newLng, speed: simulatedSpeed },
          { latitude: nextPt.lat, longitude: nextPt.lng },
          simulatedSpeed
        );

        shuttle.currentLocation = {
          latitude: newLat,
          longitude: newLng,
          speed: simulatedSpeed,
          heading,
          lastUpdated: new Date(),
        };
        shuttle.currentPassengerCount = passengers;
        shuttle.status = 'ACTIVE';
        shuttle.lastUpdated = new Date();
        await shuttle.save();

        const updatePayload = {
          shuttleId: shuttle._id,
          shuttleNumber: shuttle.shuttleNumber,
          category: cat.type,
          categoryKey: cat.categoryKey,
          latitude: newLat,
          longitude: newLng,
          speed: simulatedSpeed,
          heading,
          currentPassengerCount: passengers,
          capacity: shuttle.capacity,
          occupancyPercentage: shuttle.occupancyPercentage,
          occupancyStatus: shuttle.occupancyStatus,
          status: 'ACTIVE',
          nextStopName: nextPt.name,
          eta: etaObj.formattedText,
          etaMinutes: etaObj.minutes,
          assignedRoute: shuttle.assignedRoute,
          driver: shuttle.driver,
          lastUpdated: new Date(),
          isSimulated: true,
          operatingWindow: cat.window,
        };

        if (this.io) {
          this.io.emit('shuttle:location:update', updatePayload);
          if (shuttle.assignedRoute) {
            this.io.to(`route:${shuttle.assignedRoute._id || shuttle.assignedRoute}`).emit(
              'shuttle:location:update',
              updatePayload
            );
          }
        }
      }

      if (this.io) {
        this.io.emit('schedule:status', schedule);
      }
    } catch (err) {
      console.error('[Simulation Service] Tick error:', err.message);
    }
  }
}

const simulationServiceInstance = new SimulationService();
module.exports = simulationServiceInstance;
