const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const { authenticate } = require('../middleware/auth');
const { isJournalist } = require('../middleware/roles');

// Get all interviews
router.get('/', interviewController.getAllInterviews);

// Get interview by ID
router.get('/:id', interviewController.getInterviewById);

// Increment view count
router.post('/:id/view', interviewController.incrementViewCount);

// Create interview
router.post('/', authenticate, isJournalist, interviewController.createInterview);

// Update interview
router.put('/:id', authenticate, isJournalist, interviewController.updateInterview);

// Delete interview
router.delete('/:id', authenticate, isJournalist, interviewController.deleteInterview);

module.exports = router;
