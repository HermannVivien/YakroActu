const User = require('../models/User');
const { handleErrors } = require('./errorHandler');

// Validation des utilisateurs
const validateUser = (user) => {
  const schema = {
    name: {
      required: true,
      type: 'string',
      max: 100
    },
    email: {
      required: true,
      type: 'string',
      format: 'email'
    },
    role: {
      required: true,
      type: 'string',
      allowed: ['user', 'admin', 'editor']
    },
    status: {
      required: true,
      type: 'string',
      allowed: ['active', 'inactive', 'suspended']
    }
  };

  const errors = {};
  Object.keys(schema).forEach(field => {
    const fieldSchema = schema[field];
    const value = user[field];

    if (fieldSchema.required && !value) {
      errors[field] = `${field} is required`;
    }

    if (value && fieldSchema.type === 'string' && value.length > (fieldSchema.max || 1000)) {
      errors[field] = `${field} must be less than ${fieldSchema.max} characters`;
    }

    if (value && fieldSchema.allowed && !fieldSchema.allowed.includes(value)) {
      errors[field] = `${value} is not a valid ${field}`;
    }
  });

  return errors;
};

// Contrôleur principal
const userController = {
  // Créer un nouvel utilisateur
  createUser: async (req, res) => {
    try {
      const errors = validateUser(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const user = new User(req.body);
      await user.save();

      res.status(201).json(user);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Obtenir tous les utilisateurs
  getUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, role, status, search } = req.query;
      const query = {};

      if (role) {
        query.role = role;
      }

      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-password')
        .exec();

      const count = await User.countDocuments(query);

      res.json({
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Obtenir un utilisateur spécifique
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-password')
        .exec();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Mettre à jour un utilisateur
  updateUser: async (req, res) => {
    try {
      const errors = validateUser(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User removed' });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Changer le statut d'un utilisateur
  changeStatus: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.status = req.body.status;
      await user.save();

      res.json(user);
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

module.exports = {
  userController,
  validateUser
};
