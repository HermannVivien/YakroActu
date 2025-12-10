const express = require('express');
const router = express.Router();
const contactMessageController = require('../controllers/contactMessage.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/', contactMessageController.createMessage);

// Protected routes (admin only)
router.get('/', authenticate, contactMessageController.getAllMessages);
router.put('/:id/read', authenticate, contactMessageController.markAsRead);
router.put('/:id/replied', authenticate, contactMessageController.markAsReplied);
router.delete('/:id', authenticate, contactMessageController.deleteMessage);

module.exports = router;
