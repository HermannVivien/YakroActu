const express = require('express');
const router = express.Router();
const commentFlagController = require('../controllers/commentFlag.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, commentFlagController.getAllCommentFlags);
router.post('/', authenticate, commentFlagController.createCommentFlag);
router.put('/:id', authenticate, commentFlagController.updateCommentFlag);
router.delete('/:id', authenticate, commentFlagController.deleteCommentFlag);

module.exports = router;
