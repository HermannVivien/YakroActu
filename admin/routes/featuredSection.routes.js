const express = require('express');
const router = express.Router();
const featuredSectionController = require('../controllers/featuredSection.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', featuredSectionController.getAllFeaturedSections);
router.get('/:id', featuredSectionController.getFeaturedSectionById);
router.post('/', authenticate, featuredSectionController.createFeaturedSection);
router.put('/:id', authenticate, featuredSectionController.updateFeaturedSection);
router.delete('/:id', authenticate, featuredSectionController.deleteFeaturedSection);

module.exports = router;
