const express = require('express');
const router = express.Router();
const breakingNewsController = require('../controllers/breakingNews.controller');
const { authenticate } = require('../middleware/auth');

// Routes pour les breaking news
router.get('/', breakingNewsController.getAllBreakingNews);
router.post('/', authenticate, breakingNewsController.createBreakingNews);
router.put('/:id', authenticate, breakingNewsController.updateBreakingNews);
router.delete('/:id', authenticate, breakingNewsController.deleteBreakingNews);

module.exports = router;
