const express = require('express');
const router = express.Router();

// Import des routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const articleRoutes = require('./article.routes');
const categoryRoutes = require('./category.routes');
const mediaRoutes = require('./media.routes');
const pharmacyRoutes = require('./pharmacy.routes');
const flashInfoRoutes = require('./flashInfo.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes principales
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/media', mediaRoutes);
router.use('/pharmacies', pharmacyRoutes);
router.use('/flash-info', flashInfoRoutes);

module.exports = router;
