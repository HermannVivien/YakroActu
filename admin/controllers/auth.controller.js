const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'USER',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le statut du compte
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé ou en attente'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclure le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir l'utilisateur connecté
 */
const getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le profil
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true
      }
    });

    res.json({
      success: true,
      message: 'Profil mis à jour',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Changer le mot de passe
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Récupérer l'utilisateur avec mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Hasher et mettre à jour le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Déconnexion
 */
const logout = async (req, res, next) => {
  try {
    // Note: Avec JWT, la déconnexion se fait côté client en supprimant le token
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rafraîchir le token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requis'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur invalide'
      });
    }

    const newToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  refreshToken
};
