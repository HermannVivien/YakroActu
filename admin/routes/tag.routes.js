const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');
const { authenticate } = require('../middleware/auth');

// Routes pour les tags
router.get('/', tagController.getAllTags);
router.post('/', authenticate, tagController.createTag);
router.put('/:id', authenticate, tagController.updateTag);
router.delete('/:id', authenticate, tagController.deleteTag);

module.exports = router;
