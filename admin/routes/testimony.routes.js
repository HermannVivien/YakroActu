const express = require('express');
const router = express.Router();
const testimonyController = require('../controllers/testimony.controller');
const { authenticate } = require('../middleware/auth');
const { isJournalist } = require('../middleware/roles');

// Get all testimonies
router.get('/', testimonyController.getAllTestimonies);

// Get testimony by ID
router.get('/:id', testimonyController.getTestimonyById);

// Create testimony
router.post('/', testimonyController.createTestimony);

// Update testimony
router.put('/:id', authenticate, isJournalist, testimonyController.updateTestimony);

// Approve testimony
router.post('/:id/approve', authenticate, isJournalist, testimonyController.approveTestimony);

// Reject testimony
router.post('/:id/reject', authenticate, isJournalist, testimonyController.rejectTestimony);

// Delete testimony
router.delete('/:id', authenticate, isJournalist, testimonyController.deleteTestimony);

module.exports = router;
