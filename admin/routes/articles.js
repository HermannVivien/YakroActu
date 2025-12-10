const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { isAdmin, isJournalist } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { articleValidation } = require('../validators/common.validator');
const articleController = require('../controllers/article.controller');

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Obtenir tous les articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des articles
 */
router.get('/', articleController.getAll);

/**
 * @swagger
 * /api/articles/trending:
 *   get:
 *     summary: Obtenir les articles tendance
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Articles tendance
 */
router.get('/trending', articleController.getTrending);

/**
 * @swagger
 * /api/articles/breaking:
 *   get:
 *     summary: Obtenir les breaking news
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Breaking news
 */
router.get('/breaking', articleController.getBreaking);

/**
 * @swagger
 * /api/articles/search:
 *   get:
 *     summary: Rechercher des articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Résultats de recherche
 */
router.get('/search', articleController.search);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Obtenir un article par ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de l'article
 */
router.get('/:id', articleController.getById);

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Créer un article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Article créé
 */
router.post(
  '/',
  authenticate,
  isJournalist,
  articleValidation,
  validate,
  articleController.create
);

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Mettre à jour un article
 *     tags: [Articles]
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
 *         description: Article mis à jour
 */
router.put(
  '/:id',
  authenticate,
  isJournalist,
  articleValidation,
  validate,
  articleController.update
);

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Supprimer un article
 *     tags: [Articles]
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
 *         description: Article supprimé
 */
router.delete('/:id', authenticate, isAdmin, articleController.delete);

module.exports = router;
