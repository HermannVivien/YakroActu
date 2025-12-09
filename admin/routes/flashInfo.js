const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const FlashInfo = require('../models/FlashInfo');
const { validateFlashInfo } = require('../controllers/flashInfoController');

// @route   GET /api/flash-info
// @desc    Get all flash info
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, location } = req.query;
    const query = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by location
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 10000 // 10km
        }
      };
    }

    // Only get active flash info
    query.active = true;
    const now = new Date();
    query.startTime = { $lte: now };
    query.endTime = { $gte: now };

    const flashInfo = await FlashInfo.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await FlashInfo.countDocuments(query);

    res.json({
      flashInfo,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/flash-info/:id
// @desc    Get flash info by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const flashInfo = await FlashInfo.findById(req.params.id).exec();

    if (!flashInfo) {
      return res.status(404).json({ message: 'Flash Info not found' });
    }

    res.json(flashInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/flash-info
// @desc    Create flash info
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { error } = validateFlashInfo(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const flashInfo = new FlashInfo(req.body);
    await flashInfo.save();

    res.status(201).json(flashInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/flash-info/:id
// @desc    Update flash info
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { error } = validateFlashInfo(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const flashInfo = await FlashInfo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!flashInfo) {
      return res.status(404).json({ message: 'Flash Info not found' });
    }

    res.json(flashInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/flash-info/:id
// @desc    Delete flash info
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const flashInfo = await FlashInfo.findByIdAndDelete(req.params.id);

    if (!flashInfo) {
      return res.status(404).json({ message: 'Flash Info not found' });
    }

    res.json({ message: 'Flash Info removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/flash-info/:id/toggle-active
// @desc    Toggle active status of flash info
// @access  Private/Admin
router.post('/:id/toggle-active', [auth, admin], async (req, res) => {
  try {
    const flashInfo = await FlashInfo.findById(req.params.id);

    if (!flashInfo) {
      return res.status(404).json({ message: 'Flash Info not found' });
    }

    flashInfo.active = !flashInfo.active;
    await flashInfo.save();

    res.json(flashInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
