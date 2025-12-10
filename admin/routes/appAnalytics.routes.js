const express = require('express');
const router = express.Router();
const appAnalyticsController = require('../controllers/appAnalytics.controller');
const { authenticate } = require('../middleware/auth');

// Public routes (for mobile app to send analytics)
router.post('/track', appAnalyticsController.trackEvent);

// Protected routes (admin only)
router.get('/platform/:platform', authenticate, appAnalyticsController.getAnalyticsByPlatform);
router.get('/stats', authenticate, appAnalyticsController.getEventStats);

module.exports = router;
