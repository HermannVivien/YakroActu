const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const flashInfoController = require('../controllers/flashInfo.controller');

// Routes publiques
router.get('/', flashInfoController.getAll);
router.get('/:id', flashInfoController.getById);

// Routes admin
router.post('/', authenticate, isAdmin, flashInfoController.create);
router.put('/:id', authenticate, isAdmin, flashInfoController.update);
router.delete('/:id', authenticate, isAdmin, flashInfoController.delete);

module.exports = router;

