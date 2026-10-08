const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const query = {
      $or: [{ user: req.user._id }, { user: null }],
      dismissedBy: { $ne: req.user._id },
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, 200, 'Notifications retrieved successfully', { notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    return successResponse(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification (broadcast or user-specific)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, user } = req.body;

    if (!title || !message) {
      return errorResponse(res, 400, 'Title and message are required');
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      user: user || null,
      read: false,
    });

    return successResponse(res, 201, 'Notification created successfully', { notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification (admin deletes globally, users delete/dismiss for themselves)
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    if (req.user.role === 'admin') {
      await Notification.findByIdAndDelete(id);
    } else {
      // If notification belongs exclusively to this user, delete it
      if (notification.user && notification.user.toString() === req.user._id.toString()) {
        await Notification.findByIdAndDelete(id);
      } else {
        // Broadcast notification: dismiss for this user only
        await Notification.findByIdAndUpdate(id, {
          $addToSet: { dismissedBy: req.user._id },
        });
      }
    }

    return successResponse(res, 200, 'Notification deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all notifications for user
// @route   DELETE /api/notifications
// @access  Private
const clearAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete personal notifications
    await Notification.deleteMany({ user: userId });

    // Dismiss broadcast notifications
    await Notification.updateMany(
      { user: null },
      { $addToSet: { dismissedBy: userId } }
    );

    return successResponse(res, 200, 'All notifications cleared successfully', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
  deleteNotification,
  clearAllNotifications,
};
