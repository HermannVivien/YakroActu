const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { handleErrors } = require('./errorHandler');

const authController = {
  // Inscription
  register: async (req, res) => {
    try {
      const { email, password, name, role } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Créer un nouvel utilisateur
      const user = new User({
        email,
        password,
        name,
        role: role || 'user'
      });

      await user.save();

      // Générer un token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Connexion
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Vérifier l'utilisateur
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Vérifier le mot de passe
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Générer un token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Récupération du profil
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Mise à jour du profil
  updateProfile: async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ['name', 'email', 'phone', 'address'];
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Changement de mot de passe
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Vérifier le mot de passe actuel
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid current password' });
      }

      // Mettre à jour le mot de passe
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

module.exports = authController;
