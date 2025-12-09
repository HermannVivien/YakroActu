const FlashInfo = require('../models/FlashInfo');
const { handleErrors } = require('./errorHandler');

// Validation des flash info
const validateFlashInfo = (flashInfo) => {
  const schema = {
    title: {
      required: true,
      type: 'string',
      max: 100
    },
    content: {
      required: true,
      type: 'string'
    },
    type: {
      required: true,
      type: 'string',
      allowed: ['breaking', 'weather', 'traffic', 'health', 'emergency']
    },
    priority: {
      required: true,
      type: 'number',
      min: 1,
      max: 5
    },
    category: {
      required: true,
      type: 'string',
      allowed: ['news', 'alert', 'update', 'reminder']
    }
  };

  const errors = {};
  Object.keys(schema).forEach(field => {
    const fieldSchema = schema[field];
    const value = flashInfo[field];

    if (fieldSchema.required && !value) {
      errors[field] = `${field} is required`;
    }

    if (value && fieldSchema.type === 'string' && value.length > (fieldSchema.max || 1000)) {
      errors[field] = `${field} must be less than ${fieldSchema.max} characters`;
    }

    if (value && fieldSchema.type === 'number' && 
        (value < (fieldSchema.min || -Infinity) || value > (fieldSchema.max || Infinity))) {
      errors[field] = `${field} must be between ${fieldSchema.min} and ${fieldSchema.max}`;
    }

    if (value && fieldSchema.allowed && !fieldSchema.allowed.includes(value)) {
      errors[field] = `${value} is not a valid ${field}`;
    }
  });

  return errors;
};

// Contrôleur principal
const flashInfoController = {
  // Créer un nouveau flash info
  createFlashInfo: async (req, res) => {
    try {
      const errors = validateFlashInfo(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const flashInfo = new FlashInfo(req.body);
      await flashInfo.save();

      res.status(201).json(flashInfo);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Obtenir tous les flash info
  getFlashInfo: async (req, res) => {
    try {
      const { page = 1, limit = 10, type, category, location } = req.query;
      const query = {
        active: true,
        startTime: { $lte: new Date() },
        endTime: { $gte: new Date() }
      };

      if (type) {
        query.type = type;
      }

      if (category) {
        query.category = category;
      }

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
      handleErrors(res, error);
    }
  },

  // Obtenir un flash info spécifique
  getFlashInfoById: async (req, res) => {
    try {
      const flashInfo = await FlashInfo.findById(req.params.id).exec();

      if (!flashInfo) {
        return res.status(404).json({ error: 'Flash Info not found' });
      }

      res.json(flashInfo);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Mettre à jour un flash info
  updateFlashInfo: async (req, res) => {
    try {
      const errors = validateFlashInfo(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const flashInfo = await FlashInfo.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      if (!flashInfo) {
        return res.status(404).json({ error: 'Flash Info not found' });
      }

      res.json(flashInfo);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Supprimer un flash info
  deleteFlashInfo: async (req, res) => {
    try {
      const flashInfo = await FlashInfo.findByIdAndDelete(req.params.id);

      if (!flashInfo) {
        return res.status(404).json({ error: 'Flash Info not found' });
      }

      res.json({ message: 'Flash Info removed' });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Activer/désactiver un flash info
  toggleActive: async (req, res) => {
    try {
      const flashInfo = await FlashInfo.findById(req.params.id);

      if (!flashInfo) {
        return res.status(404).json({ error: 'Flash Info not found' });
      }

      flashInfo.active = !flashInfo.active;
      await flashInfo.save();

      res.json(flashInfo);
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

module.exports = {
  flashInfoController,
  validateFlashInfo
};
