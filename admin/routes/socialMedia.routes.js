const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMedia.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', socialMediaController.getAllSocialMedia);

// Protected routes
router.post('/', authenticate, socialMediaController.createSocialMedia);
router.put('/:id', authenticate, socialMediaController.updateSocialMedia);
router.delete('/:id', authenticate, socialMediaController.deleteSocialMedia);

module.exports = router;
