const express = require('express');
const router = express.Router();
const websiteThemeController = require('../controllers/websiteTheme.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', websiteThemeController.getAllThemes);
router.get('/active', websiteThemeController.getActiveTheme);

// Protected routes
router.post('/', authenticate, websiteThemeController.createTheme);
router.put('/:id/activate', authenticate, websiteThemeController.activateTheme);
router.delete('/:id', authenticate, websiteThemeController.deleteTheme);

module.exports = router;
