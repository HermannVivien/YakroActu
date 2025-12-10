const express = require('express');
const router = express.Router();
const appVersionController = require('../controllers/appVersion.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', appVersionController.getAllVersions);
router.get('/latest/:platform', appVersionController.getLatestVersion);

// Protected routes
router.post('/', authenticate, appVersionController.createVersion);
router.put('/:id', authenticate, appVersionController.updateVersion);
router.delete('/:id', authenticate, appVersionController.deleteVersion);

module.exports = router;
