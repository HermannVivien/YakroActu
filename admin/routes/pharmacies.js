const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Pharmacy = require('../models/Pharmacy');
const { validatePharmacy } = require('../controllers/pharmacyController');

// @route   GET /api/pharmacies
// @desc    Get all pharmacies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, location } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Géolocalisation
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 5000 // 5km
        }
      };
    }

    const pharmacies = await Pharmacy.find(query)
      .sort({ rating: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('reviews', 'rating comment')
      .exec();

    const count = await Pharmacy.countDocuments(query);

    res.json({
      pharmacies,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/pharmacies/:id
// @desc    Get pharmacy by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('reviews', 'rating comment')
      .exec();

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/pharmacies
// @desc    Create pharmacy
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { error } = validatePharmacy(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const pharmacy = new Pharmacy(req.body);
    await pharmacy.save();

    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/pharmacies/:id
// @desc    Update pharmacy
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { error } = validatePharmacy(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/pharmacies/:id
// @desc    Delete pharmacy
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json({ message: 'Pharmacy removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/pharmacies/:id/review
// @desc    Add review to pharmacy
// @access  Private
router.post('/:id/review', auth, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const review = {
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment
    };

    // Check if user already reviewed
    const existingReview = pharmacy.reviews.find(
      r => r.user.toString() === req.user.id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists' });
    }

    pharmacy.reviews.push(review);
    await pharmacy.save();

    res.json(pharmacy.reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
