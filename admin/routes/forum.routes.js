const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forum.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isJournalist } = require('../middleware/roles');

// ==================== FORUM CATEGORIES ====================
router.get('/categories', forumController.getAllForumCategories);
router.post('/categories', authenticate, isAdmin, forumController.createForumCategory);
router.put('/categories/:id', authenticate, isAdmin, forumController.updateForumCategory);
router.delete('/categories/:id', authenticate, isAdmin, forumController.deleteForumCategory);

// ==================== FORUM TOPICS ====================
router.get('/topics', forumController.getAllForumTopics);
router.get('/topics/:id', forumController.getForumTopicById);
router.post('/topics', authenticate, forumController.createForumTopic);
router.put('/topics/:id', authenticate, isJournalist, forumController.updateForumTopic);
router.delete('/topics/:id', authenticate, isJournalist, forumController.deleteForumTopic);

// ==================== FORUM POSTS ====================
router.post('/posts', authenticate, forumController.createForumPost);
router.put('/posts/:id', authenticate, forumController.updateForumPost);
router.delete('/posts/:id', authenticate, forumController.deleteForumPost);
router.post('/posts/:id/vote', authenticate, forumController.voteForumPost);

module.exports = router;
