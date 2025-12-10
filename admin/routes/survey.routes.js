const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/survey.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', surveyController.getAllSurveys);
router.get('/:id', surveyController.getSurveyById);
router.post('/', authenticate, surveyController.createSurvey);
router.put('/:id', authenticate, surveyController.updateSurvey);
router.delete('/:id', authenticate, surveyController.deleteSurvey);

module.exports = router;
