const express = require('express');
const router = express.Router();
const rssFeedController = require('../controllers/rssFeed.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', rssFeedController.getAllRssFeeds);
router.post('/', authenticate, rssFeedController.createRssFeed);
router.put('/:id', authenticate, rssFeedController.updateRssFeed);
router.delete('/:id', authenticate, rssFeedController.deleteRssFeed);

module.exports = router;
