const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, roleController.getAllRoles);
router.get('/:id', authenticate, roleController.getRoleById);
router.post('/', authenticate, roleController.createRole);
router.put('/:id', authenticate, roleController.updateRole);
router.delete('/:id', authenticate, roleController.deleteRole);

module.exports = router;
