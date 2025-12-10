const express = require('express');
const router = express.Router();
const reportageController = require('../controllers/reportage.controller');
const { authenticate } = require('../middleware/auth');
const { isJournalist } = require('../middleware/roles');

// Get all reportages
router.get('/', reportageController.getAllReportages);

// Get reportage by ID
router.get('/:id', reportageController.getReportageById);

// Increment view count
router.post('/:id/view', reportageController.incrementViewCount);

// Create reportage
router.post('/', authenticate, isJournalist, reportageController.createReportage);

// Update reportage
router.put('/:id', authenticate, isJournalist, reportageController.updateReportage);

// Delete reportage
router.delete('/:id', authenticate, isJournalist, reportageController.deleteReportage);

module.exports = router;
