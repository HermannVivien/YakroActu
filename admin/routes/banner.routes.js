const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', bannerController.getAllBanners);
router.get('/active', bannerController.getActiveBanners);
router.post('/:id/view', bannerController.incrementView);
router.post('/:id/click', bannerController.incrementClick);

// Protected routes
router.post('/', authenticate, bannerController.createBanner);
router.put('/:id', authenticate, bannerController.updateBanner);
router.delete('/:id', authenticate, bannerController.deleteBanner);

module.exports = router;
