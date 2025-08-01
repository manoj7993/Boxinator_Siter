// src/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, UserProfile, EmailVerificationToken, PasswordResetToken, RefreshToken, sequelize } = require('../models');
const { Op } = require('sequelize');

class AuthService {
  /**
   * Create a new user account
   */
  static async createUser(userData) {
    const { email, password, firstName, lastName, ...profileData } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and profile in transaction
    const result = await sequelize.transaction(async (t) => {
      const user = await User.create({
        email,
        password: passwordHash,
        role: 'user'
      }, { transaction: t });

      await UserProfile.create({
        userId: user.id,
        firstName,
        lastName,
        ...profileData
      }, { transaction: t });

      return user;
    });

    return result;
  }

  /**
   * Authenticate user credentials
   */
  static async authenticateUser(email, password) {
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: UserProfile, as: 'profile' }]
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    return user;
  }

  /**
   * Generate JWT token
   */
  static generateToken(user, expiresIn = '24h') {
    return jwt.sign(
      { 
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );
  }

  /**
   * Generate email verification token
   */
  static async generateEmailVerificationToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    
    await EmailVerificationToken.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    return token;
  }

  /**
   * Verify email token
   */
  static async verifyEmailToken(token) {
    const verificationToken = await EmailVerificationToken.findOne({
      where: { 
        token,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired verification token');
    }

    await sequelize.transaction(async (t) => {
      await User.update(
        { isEmailVerified: true },
        { where: { id: verificationToken.userId }, transaction: t }
      );

      await verificationToken.update(
        { isUsed: true },
        { transaction: t }
      );
    });

    return true;
  }

  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    await PasswordResetToken.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    return { token, user };
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token, newPassword) {
    const resetToken = await PasswordResetToken.findOne({
      where: { 
        token,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await sequelize.transaction(async (t) => {
      await User.update(
        { password: passwordHash },
        { where: { id: resetToken.userId }, transaction: t }
      );

      await resetToken.update(
        { isUsed: true },
        { transaction: t }
      );
    });

    return true;
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await user.update({ password: passwordHash });

    return true;
  }
}

module.exports = AuthService;
