const express = require('express');
const router = express.Router();
const websiteMenuController = require('../controllers/websiteMenu.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', websiteMenuController.getAllMenus);

// Protected routes
router.post('/', authenticate, websiteMenuController.createMenu);
router.put('/:id', authenticate, websiteMenuController.updateMenu);
router.delete('/:id', authenticate, websiteMenuController.deleteMenu);

module.exports = router;
