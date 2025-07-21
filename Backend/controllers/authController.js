const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, User, UserProfile, EmailVerificationToken } = require('../models');
// const { emailService } = require('../services/emailService'); // Comment out until service is created
const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  dateOfBirth: Joi.date().optional(),
  countryOfResidence: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  contactNumber: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

class AuthController {
  static async register(req, res, next) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details
        });
      }

      const { email, password, firstName, lastName, ...profileData } = value;
      
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user and profile in transaction
      const result = await sequelize.transaction(async (t) => {
        const user = await User.create({
          email,
          passwordHash,
          accountType: 'REGISTERED_USER'
        }, { transaction: t });

        await UserProfile.create({
          userId: user.id,
          firstName,
          lastName,
          ...profileData
        }, { transaction: t });

        // Create email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        await EmailVerificationToken.create({
          userId: user.id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }, { transaction: t });

        return { user, verificationToken };
      });

      // Send verification email (commented out until email service is created)
      // await emailService.sendVerificationEmail(email, result.verificationToken);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Check email for verification.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error'
        });
      }

      const { email, password } = value;

      // Find user with profile
      const user = await User.findOne({ 
        where: { email },
        include: [{ model: UserProfile, as: 'profile' }]
      });

      if (!user || !await bcrypt.compare(password, user.passwordHash)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (!user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email before logging in'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          accountType: user.accountType
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          accountType: user.accountType,
          profile: user.profile
        },
        accountType: user.accountType
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;
      
      const verificationToken = await EmailVerificationToken.findOne({
        where: { 
          token,
          isUsed: false,
          expiresAt: { [Op.gt]: new Date() }
        }
      });

      if (!verificationToken) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
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

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
