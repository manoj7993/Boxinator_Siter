const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, User, UserProfile, EmailVerificationToken } = require('../models');
const SupabaseUserService = require('../services/supabaseUserService');
// const { emailService } = require('../services/emailService'); // Comment out until service is created
const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  dateOfBirth: Joi.date().optional(),
  countryOfResidence: Joi.string().optional(),
  contactCountry: Joi.string().optional(), // Add this field that frontend is sending
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
        console.log('❌ Validation error:', error.details);
        const errorMessages = error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errorMessages,
          details: error.details // Keep original for debugging
        });
      }

      const { email, password, firstName, lastName, contactCountry, countryOfResidence, ...profileData } = value;
      
      // Map contactCountry to countryOfResidence if needed
      const country = contactCountry || countryOfResidence;
      
      // Use Supabase API if in API-only mode
      if (process.env.USE_SUPABASE_API_ONLY === 'true') {
        console.log('🔗 Using Supabase API for registration');
        console.log('📋 Registration data:', { email, firstName, lastName, country, ...profileData });
        
        try {
          const result = await SupabaseUserService.registerUser({
            email,
            password,
            firstName,
            lastName,
            countryOfResidence: country, // Use the mapped country value
            ...profileData
          });
          
          console.log('✅ Registration successful:', result);
          return res.status(201).json({
            success: true,
            message: 'Registration successful. Check email for verification.'
          });
        } catch (error) {
          console.error('❌ Supabase registration error:', error.message);
          console.error('Full error:', error);
          if (error.message === 'Email already registered') {
            return res.status(409).json({
              success: false,
              message: 'Email already registered'
            });
          }
          return res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: error.message // Add error details for debugging
          });
        }
      }
      
      // Original Sequelize logic (fallback)
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

      // Use Supabase API if in API-only mode
      if (process.env.USE_SUPABASE_API_ONLY === 'true') {
        try {
          const user = await SupabaseUserService.findUserByEmail(email);
          
          if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }

          if (!user.is_email_verified) {
            return res.status(403).json({
              success: false,
              message: 'Please verify your email before logging in'
            });
          }

          // Generate JWT token
          const token = jwt.sign(
            { 
              userId: user.id,
              accountType: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );

          return res.json({
            success: true,
            token,
            user: {
              id: user.id,
              email: user.email,
              accountType: user.role,
              profile: user.profile?.[0] || null
            },
            accountType: user.role
          });
        } catch (error) {
          console.error('Supabase login error:', error);
          return res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
          });
        }
      }

      // Original Sequelize logic (fallback)
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
