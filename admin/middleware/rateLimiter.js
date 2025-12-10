const rateLimit = require('express-rate-limit');

/**
 * Rate limiter général
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter strict pour l'authentification
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, réessayez dans 15 minutes'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter pour les uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 uploads max
  message: {
    success: false,
    message: 'Quota d\'upload dépassé, réessayez dans 1 heure'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter pour les créations d'articles
 */
const createArticleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 articles max par heure
  message: {
    success: false,
    message: 'Quota de création dépassé, réessayez plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter pour les commentaires
 */
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 commentaires max
  message: {
    success: false,
    message: 'Trop de commentaires, ralentissez un peu'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  createArticleLimiter,
  commentLimiter
};
