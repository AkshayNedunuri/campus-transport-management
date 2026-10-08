const express = require('express');
const router = express.Router();
const {
  getScheduleStatus,
  getShuttles,
  getShuttleById,
  createShuttle,
  updateShuttle,
  deleteShuttle,
  updateShuttleLocation,
  updateShuttleStatus,
} = require('../controllers/shuttleController');
const { requireAuth, requireDriver, requireAdmin } = require('../middleware/auth');

router.get('/schedule-status', getScheduleStatus);
router.get('/', getShuttles);
router.get('/:id', getShuttleById);

router.post('/', requireAuth, requireAdmin, createShuttle);
router.put('/:id', requireAuth, requireAdmin, updateShuttle);
router.delete('/:id', requireAuth, requireAdmin, deleteShuttle);

router.put('/:id/location', requireAuth, requireDriver, updateShuttleLocation);
router.put('/:id/status', requireAuth, requireDriver, updateShuttleStatus);

module.exports = router;
