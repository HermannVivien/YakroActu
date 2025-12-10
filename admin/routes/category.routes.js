const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

// Validation
const categoryValidation = [
  body('name').notEmpty().trim(),
  body('slug').optional().trim(),
  body('icon').optional().trim()
];

// Routes publiques
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.get('/:id/articles', categoryController.getArticles);

// Routes admin
router.use(authenticate);
router.use(authorize(['ADMIN']));
router.post('/', categoryValidation, validate, categoryController.create);
router.put('/:id', categoryValidation, validate, categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;
