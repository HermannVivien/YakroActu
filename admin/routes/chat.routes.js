const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Obtenir mes conversations
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des conversations
 */
router.get('/', authenticate, chatController.getMyChats);

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Créer une conversation
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PRIVATE, GROUP]
 *     responses:
 *       201:
 *         description: Conversation créée
 */
router.post('/', authenticate, chatController.createChat);

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Obtenir une conversation
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la conversation
 */
router.get('/:id', authenticate, chatController.getChatById);

/**
 * @swagger
 * /api/chats/{id}/messages:
 *   get:
 *     summary: Obtenir les messages d'une conversation
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages de la conversation
 */
router.get('/:id/messages', authenticate, chatController.getChatMessages);

/**
 * @swagger
 * /api/chats/{id}/messages:
 *   post:
 *     summary: Envoyer un message
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, image, video, audio]
 *     responses:
 *       201:
 *         description: Message envoyé
 */
router.post('/:id/messages', authenticate, chatController.sendMessage);

/**
 * @swagger
 * /api/chats/{id}/read:
 *   post:
 *     summary: Marquer les messages comme lus
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages marqués comme lus
 */
router.post('/:id/read', authenticate, chatController.markAsRead);

module.exports = router;
