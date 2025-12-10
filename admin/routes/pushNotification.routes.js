const express = require('express');
const router = express.Router();
const pushNotificationController = require('../controllers/pushNotification.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, pushNotificationController.getAllPushNotifications);
router.post('/', authenticate, pushNotificationController.createPushNotification);
router.post('/send/:id', authenticate, pushNotificationController.sendPushNotification);
router.delete('/:id', authenticate, pushNotificationController.deletePushNotification);

module.exports = router;
