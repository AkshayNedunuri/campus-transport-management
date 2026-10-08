const express = require('express');
const router = express.Router();
const {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} = require('../controllers/routeController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', getRoutes);
router.get('/:id', getRouteById);

router.post('/', requireAuth, requireAdmin, createRoute);
router.put('/:id', requireAuth, requireAdmin, updateRoute);
router.delete('/:id', requireAuth, requireAdmin, deleteRoute);

module.exports = router;
