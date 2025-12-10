const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, notificationController.getMyNotifications);
router.post('/:id/read', authenticate, notificationController.markAsRead);
router.post('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
