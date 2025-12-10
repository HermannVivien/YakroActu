/**
 * Middleware de gestion globale des erreurs
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreur Prisma
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré'
    });
  }

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: err.errors
    });
  }

  // Erreur Multer (upload)
  if (err.name === 'MulterError') {
    return handleMulterError(err, res);
  }

  // Erreur personnalisée
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Erreur par défaut
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Une erreur interne est survenue' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Gérer les erreurs Prisma
 */
const handlePrismaError = (err, res) => {
  switch (err.code) {
    case 'P2002':
      return res.status(409).json({
        success: false,
        message: 'Cette valeur existe déjà',
        field: err.meta?.target
      });

    case 'P2025':
      return res.status(404).json({
        success: false,
        message: 'Ressource non trouvée'
      });

    case 'P2003':
      return res.status(400).json({
        success: false,
        message: 'Référence invalide'
      });

    case 'P2014':
      return res.status(400).json({
        success: false,
        message: 'Violation de contrainte relationnelle'
      });

    default:
      return res.status(500).json({
        success: false,
        message: 'Erreur de base de données'
      });
  }
};

/**
 * Gérer les erreurs Multer
 */
const handleMulterError = (err, res) => {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux (max 5MB)'
      });

    case 'LIMIT_FILE_COUNT':
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers'
      });

    case 'LIMIT_UNEXPECTED_FILE':
      return res.status(400).json({
        success: false,
        message: 'Champ de fichier inattendu'
      });

    default:
      return res.status(400).json({
        success: false,
        message: 'Erreur lors de l\'upload'
      });
  }
};

/**
 * Middleware pour les routes non trouvées
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`
  });
};

/**
 * Classe d'erreur personnalisée
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFound,
  AppError
};
