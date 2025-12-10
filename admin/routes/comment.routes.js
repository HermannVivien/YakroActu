const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { commentValidation } = require('../validators/common.validator');

/**
 * @swagger
 * /api/articles/{articleId}/comments:
 *   get:
 *     summary: Obtenir les commentaires d'un article
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: articleId
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
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Liste des commentaires
 */
router.get('/articles/:articleId/comments', commentController.getArticleComments);

/**
 * @swagger
 * /api/articles/{articleId}/comments:
 *   post:
 *     summary: Ajouter un commentaire
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
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
 *     responses:
 *       201:
 *         description: Commentaire créé
 */
router.post(
  '/articles/:articleId/comments',
  authenticate,
  commentValidation,
  validate,
  commentController.addComment
);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Mettre à jour un commentaire
 *     tags: [Comments]
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
 *     responses:
 *       200:
 *         description: Commentaire mis à jour
 */
router.put(
  '/comments/:id',
  authenticate,
  commentValidation,
  validate,
  commentController.updateComment
);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Supprimer un commentaire
 *     tags: [Comments]
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
 *         description: Commentaire supprimé
 */
router.delete('/comments/:id', authenticate, commentController.deleteComment);

// Routes pour l'administration (CMS)
router.get('/comments', authenticate, commentController.getAllComments);
router.patch('/comments/:id/approve', authenticate, commentController.approveComment);
router.patch('/comments/:id/reject', authenticate, commentController.rejectComment);

module.exports = router;
