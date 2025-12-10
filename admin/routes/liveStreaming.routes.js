const express = require('express');
const router = express.Router();
const liveStreamingController = require('../controllers/liveStreaming.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', liveStreamingController.getAllLiveStreams);
router.post('/', authenticate, liveStreamingController.createLiveStream);
router.put('/:id', authenticate, liveStreamingController.updateLiveStream);
router.delete('/:id', authenticate, liveStreamingController.deleteLiveStream);

module.exports = router;
