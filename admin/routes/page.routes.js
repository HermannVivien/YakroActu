const express = require('express');
const router = express.Router();
const pageController = require('../controllers/page.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', pageController.getAllPages);
router.get('/:id', pageController.getPageById);
router.post('/', authenticate, pageController.createPage);
router.put('/:id', authenticate, pageController.updatePage);
router.delete('/:id', authenticate, pageController.deletePage);

module.exports = router;
