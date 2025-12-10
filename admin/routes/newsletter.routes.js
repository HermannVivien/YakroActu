const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);
router.get('/verify/:token', newsletterController.verifySubscriber);

// Protected routes (admin only)
router.get('/', authenticate, newsletterController.getAllSubscribers);
router.delete('/:id', authenticate, newsletterController.deleteSubscriber);

module.exports = router;
