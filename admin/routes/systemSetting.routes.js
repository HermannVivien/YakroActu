const express = require('express');
const router = express.Router();
const systemSettingController = require('../controllers/systemSetting.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, systemSettingController.getAllSettings);
router.get('/:key', authenticate, systemSettingController.getSettingByKey);
router.post('/', authenticate, systemSettingController.createSetting);
router.put('/:key', authenticate, systemSettingController.updateSetting);
router.delete('/:key', authenticate, systemSettingController.deleteSetting);

module.exports = router;
