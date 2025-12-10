const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticate } = require('../middleware/auth');

// Route protégée pour les stats du dashboard
router.get('/dashboard', authenticate, statsController.getDashboardStats);

module.exports = router;
