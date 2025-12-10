const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Middleware de vérification des rôles
 */
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Vérifier le rôle
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Permissions insuffisantes'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des permissions',
        error: error.message
      });
    }
  };
};

/**
 * Middleware pour ADMIN uniquement
 */
const isAdmin = authorize('ADMIN');

/**
 * Middleware pour ADMIN et JOURNALIST
 */
const isJournalist = authorize('ADMIN', 'JOURNALIST');

/**
 * Middleware pour vérifier si l'utilisateur peut modifier une ressource
 */
const canModify = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = parseInt(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;

      // Admin peut tout modifier
      if (userRole === 'ADMIN') {
        return next();
      }

      // Vérifier la propriété selon le type de ressource
      let resource;
      
      switch (resourceType) {
        case 'article':
          resource = await prisma.article.findUnique({
            where: { id: resourceId },
            select: { authorId: true }
          });
          
          if (!resource) {
            return res.status(404).json({
              success: false,
              message: 'Article non trouvé'
            });
          }
          
          if (resource.authorId !== userId) {
            return res.status(403).json({
              success: false,
              message: 'Vous ne pouvez modifier que vos propres articles'
            });
          }
          break;

        case 'user':
          // Un utilisateur ne peut modifier que son propre profil
          if (resourceId !== userId) {
            return res.status(403).json({
              success: false,
              message: 'Vous ne pouvez modifier que votre propre profil'
            });
          }
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Type de ressource invalide'
          });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des permissions',
        error: error.message
      });
    }
  };
};

module.exports = {
  authorize,
  isAdmin,
  isJournalist,
  canModify
};
