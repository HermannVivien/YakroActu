const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Routes admin uniquement
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.patch('/:id/status', userController.updateStatus);
router.patch('/:id/role', userController.updateRole);

module.exports = router;
