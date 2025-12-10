const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);

// Get announcement by ID
router.get('/:id', announcementController.getAnnouncementById);

// Increment view count
router.post('/:id/view', announcementController.incrementViewCount);

// Create announcement
router.post('/', authenticate, isAdmin, announcementController.createAnnouncement);

// Update announcement
router.put('/:id', authenticate, isAdmin, announcementController.updateAnnouncement);

// Delete announcement
router.delete('/:id', authenticate, isAdmin, announcementController.deleteAnnouncement);

module.exports = router;
