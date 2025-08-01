const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, User, UserProfile, EmailVerificationToken } = require('../models');
const SupabaseUserService = require('../services/supabaseUserService');
// const { emailService } = require('../services/emailService'); // Comment out until service is created
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
<<<<<<< HEAD
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
=======
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  address: Joi.string().min(5).max(500).required(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required()
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
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

<<<<<<< HEAD
      const { email, password, firstName, lastName, contactCountry, countryOfResidence, ...profileData } = value;
=======
      const { email, password, name, address, phone } = value;
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
      
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

      // Create user
      const user = await User.create({
        name,
        email,
        password: passwordHash,
        address,
        phone
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          name: user.name 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          phone: user.phone
        },
        token
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

<<<<<<< HEAD
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
=======
      // Find user
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
      const user = await User.findOne({ 
        where: { email }
      });

      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          phone: user.phone
        }
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
