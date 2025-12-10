const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, staffController.getAllStaffMembers);
router.get('/:id', authenticate, staffController.getStaffMemberById);
router.post('/', authenticate, staffController.createStaffMember);
router.put('/:id', authenticate, staffController.updateStaffMember);
router.delete('/:id', authenticate, staffController.deleteStaffMember);

module.exports = router;
