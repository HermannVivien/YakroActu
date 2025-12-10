const express = require('express');
const router = express.Router();
const sportConfigController = require('../controllers/sportConfig.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// Get all configs
router.get('/', authenticate, sportConfigController.getAllSportConfigs);

// Get active config
router.get('/active', sportConfigController.getActiveSportConfig);

// Create config
router.post('/', authenticate, isAdmin, sportConfigController.createSportConfig);

// Update config
router.put('/:id', authenticate, isAdmin, sportConfigController.updateSportConfig);

// Delete config
router.delete('/:id', authenticate, isAdmin, sportConfigController.deleteSportConfig);

module.exports = router;
