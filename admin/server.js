require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Routes
const articleRoutes = require('./routes/articles');
const pharmacyRoutes = require('./routes/pharmacies');
const flashInfoRoutes = require('./routes/flashInfo');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const subcategoryRoutes = require('./routes/subcategory.routes');
const tagRoutes = require('./routes/tag.routes');
const commentRoutes = require('./routes/comment.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const chatRoutes = require('./routes/chat.routes');
const notificationRoutes = require('./routes/notification.routes');
const statsRoutes = require('./routes/stats.routes');
const mediaRoutes = require('./routes/media.routes');
const breakingNewsRoutes = require('./routes/breakingNews.routes');
const authorRoutes = require('./routes/author.routes');
const commentFlagRoutes = require('./routes/commentFlag.routes');
const surveyRoutes = require('./routes/survey.routes');
const pageRoutes = require('./routes/page.routes');
const featuredSectionRoutes = require('./routes/featuredSection.routes');
const adSpaceRoutes = require('./routes/adSpace.routes');
const liveStreamingRoutes = require('./routes/liveStreaming.routes');
const rssFeedRoutes = require('./routes/rssFeed.routes');
const roleRoutes = require('./routes/role.routes');
const staffRoutes = require('./routes/staff.routes');
const systemSettingRoutes = require('./routes/systemSetting.routes');
const appVersionRoutes = require('./routes/appVersion.routes');
const appConfigRoutes = require('./routes/appConfig.routes');
const bannerRoutes = require('./routes/banner.routes');
const pushNotificationRoutes = require('./routes/pushNotification.routes');
const websiteMenuRoutes = require('./routes/websiteMenu.routes');
const websiteThemeRoutes = require('./routes/websiteTheme.routes');
const socialMediaRoutes = require('./routes/socialMedia.routes');
const contactMessageRoutes = require('./routes/contactMessage.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const appAnalyticsRoutes = require('./routes/appAnalytics.routes');
const sportConfigRoutes = require('./routes/sportConfig.routes');
const reportageRoutes = require('./routes/reportage.routes');
const interviewRoutes = require('./routes/interview.routes');
const announcementRoutes = require('./routes/announcement.routes');
const testimonyRoutes = require('./routes/testimony.routes');
const forumRoutes = require('./routes/forum.routes');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuration CORS plus permissive pour le développement
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
    // Autoriser les requêtes sans origine (comme Postman) ou depuis les origines autorisées
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Préflight pour toutes les routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/articles', articleRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/flash-info', flashInfoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api', commentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/breaking-news', breakingNewsRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/comment-flags', commentFlagRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/featured-sections', featuredSectionRoutes);
app.use('/api/ad-spaces', adSpaceRoutes);
app.use('/api/live-streaming', liveStreamingRoutes);
app.use('/api/rss-feeds', rssFeedRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/settings', systemSettingRoutes);
app.use('/api/app-versions', appVersionRoutes);
app.use('/api/app-config', appConfigRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/push-notifications', pushNotificationRoutes);
app.use('/api/website-menus', websiteMenuRoutes);
app.use('/api/website-themes', websiteThemeRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/contact-messages', contactMessageRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/analytics', appAnalyticsRoutes);
app.use('/api/sport-config', sportConfigRoutes);
app.use('/api/reportages', reportageRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/testimonies', testimonyRoutes);
app.use('/api/forum', forumRoutes);

// Error handling
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
    
    // Initialiser Socket.IO
    const { initializeSocket } = require('./services/socket.service');
    initializeSocket(server);
    console.log('Socket.IO initialized');
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
