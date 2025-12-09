const Pharmacy = require('../models/Pharmacy');
const { handleErrors } = require('./errorHandler');

// Validation des pharmacies
const validatePharmacy = (pharmacy) => {
  const schema = {
    name: {
      required: true,
      type: 'string',
      max: 100
    },
    address: {
      required: true,
      type: 'string'
    },
    location: {
      required: true,
      type: 'object',
      requiredFields: ['coordinates']
    },
    phone: {
      required: true,
      type: 'string'
    },
    status: {
      required: true,
      type: 'string',
      allowed: ['active', 'inactive', 'maintenance']
    }
  };

  const errors = {};
  Object.keys(schema).forEach(field => {
    const fieldSchema = schema[field];
    const value = pharmacy[field];

    if (fieldSchema.required && !value) {
      errors[field] = `${field} is required`;
    }

    if (value && fieldSchema.type === 'string' && value.length > (fieldSchema.max || 1000)) {
      errors[field] = `${field} must be less than ${fieldSchema.max} characters`;
    }

    if (value && fieldSchema.allowed && !fieldSchema.allowed.includes(value)) {
      errors[field] = `${value} is not a valid ${field}`;
    }

    if (field === 'location' && value) {
      if (!value.coordinates || !Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
        errors[field] = 'Location must have valid coordinates array';
      }
    }
  });

  return errors;
};

// Contrôleur principal
const pharmacyController = {
  // Créer une nouvelle pharmacie
  createPharmacy: async (req, res) => {
    try {
      const errors = validatePharmacy(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const pharmacy = new Pharmacy(req.body);
      await pharmacy.save();

      res.status(201).json(pharmacy);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Obtenir toutes les pharmacies
  getPharmacies: async (req, res) => {
    try {
      const { page = 1, limit = 10, category, search, location } = req.query;
      const query = {};

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$text = { $search: search };
      }

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
      handleErrors(res, error);
    }
  },

  // Obtenir une pharmacie spécifique
  getPharmacy: async (req, res) => {
    try {
      const pharmacy = await Pharmacy.findById(req.params.id)
        .populate('reviews', 'rating comment')
        .exec();

      if (!pharmacy) {
        return res.status(404).json({ error: 'Pharmacy not found' });
      }

      res.json(pharmacy);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Mettre à jour une pharmacie
  updatePharmacy: async (req, res) => {
    try {
      const errors = validatePharmacy(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const pharmacy = await Pharmacy.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      if (!pharmacy) {
        return res.status(404).json({ error: 'Pharmacy not found' });
      }

      res.json(pharmacy);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Supprimer une pharmacie
  deletePharmacy: async (req, res) => {
    try {
      const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);

      if (!pharmacy) {
        return res.status(404).json({ error: 'Pharmacy not found' });
      }

      res.json({ message: 'Pharmacy removed' });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Ajouter un avis à une pharmacie
  addReview: async (req, res) => {
    try {
      const pharmacy = await Pharmacy.findById(req.params.id);

      if (!pharmacy) {
        return res.status(404).json({ error: 'Pharmacy not found' });
      }

      const review = {
        user: req.user._id,
        rating: req.body.rating,
        comment: req.body.comment
      };

      // Vérifier si l'utilisateur a déjà commenté
      const existingReview = pharmacy.reviews.find(
        r => r.user.toString() === req.user._id.toString()
      );

      if (existingReview) {
        return res.status(400).json({ error: 'Review already exists' });
      }

      pharmacy.reviews.push(review);
      await pharmacy.save();

      res.json(pharmacy.reviews);
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

module.exports = {
  pharmacyController,
  validatePharmacy
};
