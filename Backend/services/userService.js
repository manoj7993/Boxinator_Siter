// src/services/userService.js
const { User, UserProfile } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class UserService {
  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'accountType', 'isEmailVerified', 'createdAt'],
      include: [
        { 
          model: UserProfile, 
          as: 'profile',
          attributes: ['firstName', 'lastName', 'dateOfBirth', 'countryOfResidence', 'zipCode', 'contactNumber']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, profileData) {
    const { email, firstName, lastName, dateOfBirth, countryOfResidence, zipCode, contactNumber } = profileData;

    const user = await User.findByPk(userId, {
      include: [{ model: UserProfile, as: 'profile' }]
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    await sequelize.transaction(async (t) => {
      // Update user email if provided
      if (email && email !== user.email) {
        await user.update({ 
          email,
          isEmailVerified: false // Require re-verification if email changed
        }, { transaction: t });
      }

      // Update profile
      if (user.profile) {
        await user.profile.update({
          firstName,
          lastName,
          dateOfBirth,
          countryOfResidence,
          zipCode,
          contactNumber
        }, { transaction: t });
      } else {
        await UserProfile.create({
          userId,
          firstName,
          lastName,
          dateOfBirth,
          countryOfResidence,
          zipCode,
          contactNumber
        }, { transaction: t });
      }
    });

    // Return updated user
    return this.getUserProfile(userId);
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    await user.update({ passwordHash });

    return true;
  }

  /**
   * Delete user account
   */
  static async deleteUserAccount(userId, deletedByUserId = null) {
    const user = await User.findByPk(userId, {
      include: [{ model: UserProfile, as: 'profile' }]
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has active shipments
    const activeShipments = await user.getShipments({
      where: {
        currentStatusCode: {
          [Op.notIn]: ['DELIVERED', 'CANCELLED']
        }
      }
    });

    if (activeShipments.length > 0) {
      throw new Error('Cannot delete account with active shipments');
    }

    await sequelize.transaction(async (t) => {
      // Delete profile first
      if (user.profile) {
        await user.profile.destroy({ transaction: t });
      }
      
      // Delete user
      await user.destroy({ transaction: t });
    });

    // Log admin action if deleted by admin
    if (deletedByUserId && deletedByUserId !== userId) {
      await auditService.logAdminAction(
        deletedByUserId,
        'DELETE_USER',
        `Deleted user account ${userId}`,
        { deletedUserId: userId, email: user.email }
      );
    }

    return true;
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(options = {}) {
    const { page = 1, limit = 10, search, accountType } = options;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (accountType) {
      whereClause.accountType = accountType;
    }

    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { '$profile.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$profile.lastName$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const result = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'email', 'accountType', 'isEmailVerified', 'createdAt'],
      include: [
        { 
          model: UserProfile, 
          as: 'profile',
          attributes: ['firstName', 'lastName', 'countryOfResidence']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      users: result.rows,
      total: result.count,
      page,
      pages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId, newRole, updatedByUserId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const validRoles = ['REGISTERED_USER', 'ADMINISTRATOR'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role');
    }

    const oldRole = user.accountType;
    await user.update({ accountType: newRole });

    // Log admin action
    await auditService.logAdminAction(
      updatedByUserId,
      'UPDATE_USER_ROLE',
      `Changed user ${userId} role from ${oldRole} to ${newRole}`,
      { userId, oldRole, newRole }
    );

    return user;
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    const stats = await User.findAll({
      attributes: [
        'accountType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['accountType'],
      raw: true
    });

    const totalUsers = await User.count();
    const verifiedUsers = await User.count({ where: { isEmailVerified: true } });

    return {
      totalUsers,
      verifiedUsers,
      roleStats: stats
    };
  }

  /**
   * Search users
   */
  static async searchUsers(query, limit = 10) {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: `%${query}%` } },
          { '$profile.firstName$': { [Op.iLike]: `%${query}%` } },
          { '$profile.lastName$': { [Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'email', 'accountType'],
      include: [
        { 
          model: UserProfile, 
          as: 'profile',
          attributes: ['firstName', 'lastName']
        }
      ],
      limit
    });

    return users;
  }

  /**
   * Check if user exists by email
   */
  static async userExistsByEmail(email) {
    const user = await User.findOne({ where: { email } });
    return !!user;
  }

  /**
   * Get user activity summary
   */
  static async getUserActivitySummary(userId) {
    const user = await User.findByPk(userId, {
      include: [
        { 
          model: Shipment, 
          as: 'shipments',
          attributes: ['currentStatusCode'],
          separate: true
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    const shipmentStats = user.shipments.reduce((acc, shipment) => {
      acc[shipment.currentStatusCode] = (acc[shipment.currentStatusCode] || 0) + 1;
      return acc;
    }, {});

    return {
      totalShipments: user.shipments.length,
      shipmentsByStatus: shipmentStats,
      accountCreated: user.createdAt,
      emailVerified: user.isEmailVerified
    };
  }
}

module.exports = UserService;
