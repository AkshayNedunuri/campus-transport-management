const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleFavoriteRoute,
  toggleFavoriteStop,
} = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

router.post('/favorites/route/:routeId', toggleFavoriteRoute);
router.post('/favorites/stop/:stopId', toggleFavoriteStop);

router.get('/', requireAdmin, getUsers);
router.post('/', requireAdmin, createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;
