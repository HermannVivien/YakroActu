const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Routes protégées
router.use(authenticate);
router.post('/upload', upload.single('file'), mediaController.upload);
router.post('/upload-multiple', upload.array('files', 10), mediaController.uploadMultiple);
router.delete('/:id', mediaController.delete);
router.get('/', mediaController.getAll);
router.get('/:id', mediaController.getById);

module.exports = router;
