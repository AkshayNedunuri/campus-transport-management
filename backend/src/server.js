require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const setupSockets = require('./sockets/socketHandler');
const simulationService = require('./services/simulationService');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const shuttleRoutes = require('./routes/shuttleRoutes');
const routeRoutes = require('./routes/routeRoutes');
const stopRoutes = require('./routes/stopRoutes');
const tripRoutes = require('./routes/tripRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Permissive CORS check for development and local testing
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  return true; // Default allow in development
};

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Pass IO to socket handler & simulation
setupSockets(io);

// Security Middleware (configure helmet to not block cross-origin requests in development)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging Middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');

// API Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Transport Management System API is running smoothly',
    timestamp: new Date(),
    simulation: simulationService.getStatus(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// In production or unified deployment: serve built frontend static assets if available
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
const fs = require('fs');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Fallback API root response
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Campus Transport Management System API is live. Connect frontend to /api routes.',
      timestamp: new Date(),
      simulation: simulationService.getStatus(),
    });
  });
}

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  
  // Automatically start demo simulation so shuttles are live on first launch
  setTimeout(async () => {
    try {
      await simulationService.start();
      console.log('[Server] Auto-started live shuttle simulation for demonstration.');
    } catch (err) {
      console.log('[Server] Simulation startup note:', err.message);
    }
  }, 2000);
});

module.exports = { app, server, io };
