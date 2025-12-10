const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategory.controller');
const { authenticate } = require('../middleware/auth');

// Routes pour les sous-catégories
router.get('/', subcategoryController.getAllSubcategories);
router.get('/:id', subcategoryController.getSubcategoryById);
router.post('/', authenticate, subcategoryController.createSubcategory);
router.put('/:id', authenticate, subcategoryController.updateSubcategory);
router.delete('/:id', authenticate, subcategoryController.deleteSubcategory);

module.exports = router;
