const express = require('express');
const router = express.Router();
const authorController = require('../controllers/author.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authorController.getAllAuthors);
router.get('/:id', authorController.getAuthorById);
router.post('/', authenticate, authorController.createAuthor);
router.put('/:id', authenticate, authorController.updateAuthor);
router.delete('/:id', authenticate, authorController.deleteAuthor);

module.exports = router;
