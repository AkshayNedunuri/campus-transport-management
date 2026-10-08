const express = require('express');
const router = express.Router();
const {
  getStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
} = require('../controllers/stopController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', getStops);
router.get('/:id', getStopById);

router.post('/', requireAuth, requireAdmin, createStop);
router.put('/:id', requireAuth, requireAdmin, updateStop);
router.delete('/:id', requireAuth, requireAdmin, deleteStop);

module.exports = router;
