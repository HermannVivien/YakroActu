const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Obtenir mes favoris
 *     tags: [Favorites]
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
 *         description: Liste des favoris
 */
router.get('/', authenticate, favoriteController.getMyFavorites);

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Ajouter un favori
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articleId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Favori ajouté
 */
router.post('/', authenticate, favoriteController.addFavorite);

/**
 * @swagger
 * /api/favorites/{articleId}:
 *   delete:
 *     summary: Retirer un favori
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Favori retiré
 */
router.delete('/:articleId', authenticate, favoriteController.removeFavorite);

/**
 * @swagger
 * /api/favorites/{articleId}/check:
 *   get:
 *     summary: Vérifier si un article est en favori
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statut du favori
 */
router.get('/:articleId/check', authenticate, favoriteController.checkFavorite);

module.exports = router;
