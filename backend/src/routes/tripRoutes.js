const express = require('express');
const router = express.Router();
const {
  getTrips,
  searchTrips,
  getTripById,
  createTrip,
  updateTrip,
  startTrip,
  endTrip,
  deleteTrip,
} = require('../controllers/tripController');
const { requireAuth, requireDriver, requireAdmin } = require('../middleware/auth');

router.get('/search', searchTrips);
router.get('/', getTrips);
router.get('/:id', getTripById);

router.post('/', requireAuth, requireAdmin, createTrip);
router.put('/:id', requireAuth, updateTrip);
router.put('/:id/start', requireAuth, requireDriver, startTrip);
router.put('/:id/end', requireAuth, requireDriver, endTrip);
router.delete('/:id', requireAuth, requireAdmin, deleteTrip);

module.exports = router;
