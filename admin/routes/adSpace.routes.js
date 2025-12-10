const express = require('express');
const router = express.Router();
const adSpaceController = require('../controllers/adSpace.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', adSpaceController.getAllAdSpaces);
router.post('/', authenticate, adSpaceController.createAdSpace);
router.put('/:id', authenticate, adSpaceController.updateAdSpace);
router.delete('/:id', authenticate, adSpaceController.deleteAdSpace);

module.exports = router;
