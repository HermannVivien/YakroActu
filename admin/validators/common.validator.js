const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware de validation
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

/**
 * Validation inscription
 */
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le prénom doit contenir entre 2 et 100 caractères'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Numéro de téléphone invalide')
];

/**
 * Validation connexion
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

/**
 * Validation article
 */
const articleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ min: 10, max: 500 })
    .withMessage('Le titre doit contenir entre 10 et 500 caractères'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Le contenu est requis')
    .isLength({ min: 100 })
    .withMessage('Le contenu doit contenir au moins 100 caractères'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('L\'extrait ne peut pas dépasser 500 caractères'),
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('La catégorie est requise'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Statut invalide'),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('URL de l\'image invalide'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned doit être un booléen'),
  body('isBreaking')
    .optional()
    .isBoolean()
    .withMessage('isBreaking doit être un booléen')
];

/**
 * Validation catégorie
 */
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('L\'icône ne peut pas dépasser 100 caractères'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Couleur invalide (format: #RRGGBB)')
];

/**
 * Validation commentaire
 */
const commentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Le contenu est requis')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Le contenu doit contenir entre 3 et 1000 caractères'),
  param('articleId')
    .isInt({ min: 1 })
    .withMessage('ID d\'article invalide')
];

/**
 * Validation pharmacie
 */
const pharmacyValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom doit contenir entre 3 et 200 caractères'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('L\'adresse est requise'),
  body('phone')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Numéro de téléphone invalide'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude invalide'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude invalide'),
  body('isOnDuty')
    .optional()
    .isBoolean()
    .withMessage('isOnDuty doit être un booléen')
];

/**
 * Validation ID
 */
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID invalide')
];

/**
 * Validation pagination
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  articleValidation,
  categoryValidation,
  commentValidation,
  pharmacyValidation,
  idValidation,
  paginationValidation
};
