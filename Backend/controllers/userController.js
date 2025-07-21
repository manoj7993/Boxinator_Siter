const { User, UserProfile } = require('../models');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  dateOfBirth: Joi.date().optional(),
  countryOfResidence: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  contactNumber: Joi.string().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
});

class UserController {
  static async getProfile(req, res, next) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user.id;
      const isAdmin = req.user.accountType === 'ADMINISTRATOR';

      // Users can only view their own profile unless admin
      if (id !== requestingUserId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const user = await User.findByPk(id, {
        include: [{ model: UserProfile, as: 'profile' }],
        attributes: { exclude: ['passwordHash'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user.id;
      const isAdmin = req.user.accountType === 'ADMINISTRATOR';

      // Users can only update their own profile unless admin
      if (id !== requestingUserId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details
        });
      }

      const profile = await UserProfile.findOne({ where: { userId: id } });
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      await profile.update(value);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        profile
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { error, value } = changePasswordSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details
        });
      }

      const { currentPassword, newPassword } = value;

      const user = await User.findByPk(userId);
      if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await user.update({ passwordHash: newPasswordHash });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      const { id } = req.params;
      
      // Only administrators can delete accounts
      if (req.user.accountType !== 'ADMINISTRATOR') {
        return res.status(403).json({
          success: false,
          message: 'Administrator access required'
        });
      }

      const deleted = await User.destroy({ where: { id } });
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
