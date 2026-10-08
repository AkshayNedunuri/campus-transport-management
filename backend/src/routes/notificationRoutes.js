const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  createNotification,
  deleteNotification,
  clearAllNotifications,
} = require('../controllers/notificationController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);
router.post('/', requireAdmin, createNotification);

module.exports = router;
