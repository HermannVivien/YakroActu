const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Service d'authentification
 */
class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(userData) {
    const { email, password, firstName, lastName, phone } = userData;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'USER',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    return user;
  }

  /**
   * Connexion utilisateur
   */
  async login(email, password) {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le statut
    if (user.status !== 'ACTIVE') {
      throw new Error('Votre compte est désactivé');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Générer les tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Générer un access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  /**
   * Générer un refresh token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Rafraîchir le token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new Error('Utilisateur non trouvé ou désactivé');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Ancien mot de passe incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Mot de passe modifié avec succès' };
  }
}

module.exports = new AuthService();
