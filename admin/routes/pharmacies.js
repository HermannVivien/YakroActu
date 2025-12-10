const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { pharmacyValidation } = require('../validators/common.validator');
const pharmacyController = require('../controllers/pharmacy.controller');

// Routes publiques
router.get('/', pharmacyController.getAll);
router.get('/on-duty', pharmacyController.getOnDuty);
router.get('/search', pharmacyController.search);
router.get('/:id', pharmacyController.getById);

// Routes admin
router.post('/', authenticate, isAdmin, pharmacyValidation, validate, pharmacyController.create);
router.put('/:id', authenticate, isAdmin, pharmacyValidation, validate, pharmacyController.update);
router.delete('/:id', authenticate, isAdmin, pharmacyController.delete);

module.exports = router;

