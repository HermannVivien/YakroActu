const express = require('express');
const router = express.Router();
const appConfigController = require('../controllers/appConfig.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', appConfigController.getAllConfigs);
router.get('/:platform', appConfigController.getConfigsByPlatform);

// Protected routes
router.post('/', authenticate, appConfigController.createConfig);
router.put('/:id', authenticate, appConfigController.updateConfig);
router.delete('/:id', authenticate, appConfigController.deleteConfig);

module.exports = router;
