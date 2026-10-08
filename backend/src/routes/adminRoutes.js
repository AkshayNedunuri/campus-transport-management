const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalyticsData,
  toggleSimulation,
  getSimulationStatus,
} = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/simulation/status', getSimulationStatus);
router.get('/dashboard', requireAuth, requireAdmin, getDashboardStats);
router.get('/analytics', requireAuth, requireAdmin, getAnalyticsData);
router.post('/simulation/toggle', requireAuth, requireAdmin, toggleSimulation);

module.exports = router;
