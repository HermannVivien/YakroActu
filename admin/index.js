require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// ================== MIDDLEWARES ==================
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================== ROUTES ==================
app.get('/', (req, res) => {
  res.json({
    message: 'YakroActu API - Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      articles: '/api/articles',
      categories: '/api/categories',
      pharmacies: '/api/pharmacies',
      flashInfo: '/api/flash-info',
      media: '/api/media'
    },
    docs: '/api-docs'
  });
});

// Import des routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const articleRoutes = require('./routes/article.routes');
const categoryRoutes = require('./routes/category.routes');
const pharmacyRoutes = require('./routes/pharmacy.routes');
const flashInfoRoutes = require('./routes/flashInfo.routes');
const mediaRoutes = require('./routes/media.routes');

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/flash-info', flashInfoRoutes);
app.use('/api/media', mediaRoutes);

// ================== ERROR HANDLING ==================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ================== SERVER START ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║      🚀 YakroActu API Server Running       ║
╠════════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV?.padEnd(28) || 'development'.padEnd(28)} ║
║  Port: ${PORT.toString().padEnd(35)} ║
║  URL: http://localhost:${PORT.toString().padEnd(24)} ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
