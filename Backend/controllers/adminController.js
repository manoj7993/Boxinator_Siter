const { 
  User, 
  UserProfile, 
  Shipment, 
  Country, 
  ShipmentStatus, 
  ShipmentStatusHistory,
  AdminActionLog,
  CountryMultiplierLog,
  WeightTier 
} = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

class AdminController {
  // Middleware to ensure only administrators can access these endpoints
  static requireAdmin(req, res, next) {
    if (req.user.accountType !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Administrator access required'
      });
    }
    next();
  }

  // GET /admin/dashboard - System overview and statistics
  static async getDashboard(req, res, next) {
    try {
      const [
        totalUsers,
        totalShipments,
        activeShipments,
        completedShipments,
        recentShipments,
        topCountries
      ] = await Promise.all([
        User.count({ where: { accountType: { [Op.ne]: 'GUEST' } } }),
        Shipment.count(),
        Shipment.count({ where: { currentStatusCode: { [Op.in]: ['CREATED', 'RECEIVED', 'INTRANSIT'] } } }),
        Shipment.count({ where: { currentStatusCode: 'COMPLETED' } }),
        Shipment.findAll({
          limit: 10,
          order: [['createdAt', 'DESC']],
          include: [
            { model: Country, as: 'destinationCountry' },
            { model: WeightTier, as: 'weightTier' },
            { model: ShipmentStatus, as: 'currentStatus' }
          ]
        }),
        Shipment.findAll({
          attributes: [
            'destinationCountryId',
            [sequelize.fn('COUNT', '*'), 'shipmentCount']
          ],
          include: [{ model: Country, as: 'destinationCountry' }],
          group: ['destinationCountryId', 'destinationCountry.id'],
          order: [[sequelize.fn('COUNT', '*'), 'DESC']],
          limit: 5
        })
      ]);

      res.json({
        success: true,
        dashboard: {
          stats: {
            totalUsers,
            totalShipments,
            activeShipments,
            completedShipments
          },
          recentShipments,
          topCountries
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/shipments - View all shipments with filtering
  static async getAllShipments(req, res, next) {
    try {
      const { status, fromDate, toDate, country, page = 1, limit = 20 } = req.query;
      
      let whereClause = {};
      
      // Status filter
      if (status) {
        whereClause.currentStatusCode = status;
      }

      // Date range filter
      if (fromDate || toDate) {
        whereClause.createdAt = {};
        if (fromDate) whereClause.createdAt[Op.gte] = new Date(fromDate);
        if (toDate) whereClause.createdAt[Op.lte] = new Date(toDate);
      }

      // Country filter
      if (country) {
        whereClause.destinationCountryId = country;
      }

      const offset = (page - 1) * limit;

      const { rows: shipments, count: totalCount } = await Shipment.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', include: [{ model: UserProfile, as: 'profile' }] },
          { model: Country, as: 'destinationCountry' },
          { model: WeightTier, as: 'weightTier' },
          { model: ShipmentStatus, as: 'currentStatus' }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        shipments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + shipments.length < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /admin/shipments/:id/status - Update shipment status
  static async updateShipmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { statusCode, notes } = req.body;

      const statusSchema = Joi.object({
        statusCode: Joi.string().valid('CREATED', 'RECEIVED', 'INTRANSIT', 'COMPLETED', 'CANCELLED').required(),
        notes: Joi.string().max(500).optional()
      });

      const { error, value } = statusSchema.validate({ statusCode, notes });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details
        });
      }

      const shipment = await Shipment.findByPk(id);
      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      const oldStatus = shipment.currentStatusCode;

      // Update in transaction
      await sequelize.transaction(async (t) => {
        // Update shipment status
        await shipment.update(
          { currentStatusCode: statusCode },
          { transaction: t }
        );

        // Add to status history
        await ShipmentStatusHistory.create({
          shipmentId: shipment.id,
          statusCode,
          changedByUserId: req.user.id,
          notes: notes || `Status changed from ${oldStatus} to ${statusCode}`
        }, { transaction: t });

        // Log admin action
        await AdminActionLog.create({
          actorUserId: req.user.id,
          entityType: 'shipment',
          entityId: shipment.id,
          action: 'STATUS_UPDATE',
          beforeData: { currentStatusCode: oldStatus },
          afterData: { currentStatusCode: statusCode }
        }, { transaction: t });
      });

      res.json({
        success: true,
        message: 'Shipment status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/users - View all users with filtering
  static async getAllUsers(req, res, next) {
    try {
      const { accountType, verified, page = 1, limit = 20 } = req.query;
      
      let whereClause = {};
      
      // Account type filter
      if (accountType) {
        whereClause.accountType = accountType;
      }

      // Email verification filter
      if (verified !== undefined) {
        whereClause.isEmailVerified = verified === 'true';
      }

      const offset = (page - 1) * limit;

      const { rows: users, count: totalCount } = await User.findAndCountAll({
        where: whereClause,
        include: [{ model: UserProfile, as: 'profile' }],
        attributes: { exclude: ['passwordHash'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + users.length < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /admin/users/:id/role - Update user role
  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { accountType } = req.body;

      const roleSchema = Joi.object({
        accountType: Joi.string().valid('GUEST', 'REGISTERED_USER', 'ADMINISTRATOR').required()
      });

      const { error } = roleSchema.validate({ accountType });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid account type'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const oldRole = user.accountType;

      await sequelize.transaction(async (t) => {
        await user.update({ accountType }, { transaction: t });

        // Log admin action
        await AdminActionLog.create({
          actorUserId: req.user.id,
          entityType: 'user',
          entityId: user.id,
          action: 'ROLE_UPDATE',
          beforeData: { accountType: oldRole },
          afterData: { accountType }
        }, { transaction: t });
      });

      res.json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /admin/users/:id - Delete user account
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const user = await User.findByPk(id, {
        include: [{ model: UserProfile, as: 'profile' }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await sequelize.transaction(async (t) => {
        // Log the deletion before actually deleting
        await AdminActionLog.create({
          actorUserId: req.user.id,
          entityType: 'user',
          entityId: user.id,
          action: 'ACCOUNT_DELETE',
          beforeData: {
            email: user.email,
            accountType: user.accountType,
            profile: user.profile
          },
          afterData: null
        }, { transaction: t });

        // Delete the user (cascade should handle profile and related records)
        await user.destroy({ transaction: t });
      });

      res.json({
        success: true,
        message: 'User account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/logs - View admin action logs
  static async getAdminLogs(req, res, next) {
    try {
      const { action, fromDate, toDate, page = 1, limit = 20 } = req.query;
      
      let whereClause = {};
      
      // Action filter
      if (action) {
        whereClause.action = action;
      }

      // Date range filter
      if (fromDate || toDate) {
        whereClause.actionAt = {};
        if (fromDate) whereClause.actionAt[Op.gte] = new Date(fromDate);
        if (toDate) whereClause.actionAt[Op.lte] = new Date(toDate);
      }

      const offset = (page - 1) * limit;

      const { rows: logs, count: totalCount } = await AdminActionLog.findAndCountAll({
        where: whereClause,
        include: [{ 
          model: User, 
          as: 'actor',
          include: [{ model: UserProfile, as: 'profile' }],
          attributes: { exclude: ['passwordHash'] }
        }],
        order: [['actionAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + logs.length < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/analytics - Advanced analytics data
  static async getAnalytics(req, res, next) {
    try {
      const { period = '30' } = req.query; // Default to 30 days
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [
        shipmentsByStatus,
        shipmentsByCountry,
        revenueByPeriod,
        userRegistrations,
        shipmentTrends
      ] = await Promise.all([
        // Shipments by status
        Shipment.findAll({
          attributes: [
            'currentStatusCode',
            [sequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['currentStatusCode']
        }),

        // Shipments by country
        Shipment.findAll({
          attributes: [
            [sequelize.fn('COUNT', '*'), 'count'],
            [sequelize.fn('SUM', sequelize.col('cost')), 'totalRevenue']
          ],
          include: [{ model: Country, as: 'destinationCountry' }],
          where: { createdAt: { [Op.gte]: startDate } },
          group: ['destinationCountryId', 'destinationCountry.id'],
          order: [[sequelize.fn('COUNT', '*'), 'DESC']]
        }),

        // Revenue by period (daily for last 30 days)
        sequelize.query(`
          SELECT DATE(created_at) as date, 
                 COUNT(*) as shipments, 
                 SUM(cost) as revenue
          FROM shipments 
          WHERE created_at >= :startDate
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at)
        `, {
          replacements: { startDate },
          type: sequelize.QueryTypes.SELECT
        }),

        // User registrations trend
        User.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', '*'), 'registrations']
          ],
          where: { 
            createdAt: { [Op.gte]: startDate },
            accountType: { [Op.ne]: 'GUEST' }
          },
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        }),

        // Shipment status transition trends
        ShipmentStatusHistory.findAll({
          attributes: [
            'statusCode',
            [sequelize.fn('DATE', sequelize.col('changedAt')), 'date'],
            [sequelize.fn('COUNT', '*'), 'count']
          ],
          where: { changedAt: { [Op.gte]: startDate } },
          group: ['statusCode', sequelize.fn('DATE', sequelize.col('changedAt'))],
          order: [[sequelize.fn('DATE', sequelize.col('changedAt')), 'ASC']]
        })
      ]);

      res.json({
        success: true,
        analytics: {
          period: `${days} days`,
          shipmentsByStatus,
          shipmentsByCountry,
          revenueByPeriod,
          userRegistrations,
          shipmentTrends
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/reports/export - Export data for reporting
  static async exportReport(req, res, next) {
    try {
      const { type, format = 'json', fromDate, toDate } = req.query;

      let whereClause = {};
      if (fromDate || toDate) {
        whereClause.createdAt = {};
        if (fromDate) whereClause.createdAt[Op.gte] = new Date(fromDate);
        if (toDate) whereClause.createdAt[Op.lte] = new Date(toDate);
      }

      let data;
      let filename;

      switch (type) {
        case 'shipments':
          data = await Shipment.findAll({
            where: whereClause,
            include: [
              { model: User, as: 'user', include: [{ model: UserProfile, as: 'profile' }] },
              { model: Country, as: 'destinationCountry' },
              { model: WeightTier, as: 'weightTier' },
              { model: ShipmentStatus, as: 'currentStatus' }
            ]
          });
          filename = `shipments_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'users':
          data = await User.findAll({
            where: whereClause,
            include: [{ model: UserProfile, as: 'profile' }],
            attributes: { exclude: ['passwordHash'] }
          });
          filename = `users_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'revenue':
          data = await sequelize.query(`
            SELECT 
              c.name as country,
              DATE(s.created_at) as date,
              COUNT(*) as shipments,
              SUM(s.cost) as total_revenue
            FROM shipments s
            JOIN countries c ON s.destination_country_id = c.id
            WHERE s.created_at >= :fromDate AND s.created_at <= :toDate
            GROUP BY c.id, DATE(s.created_at)
            ORDER BY DATE(s.created_at), c.name
          `, {
            replacements: { fromDate: fromDate || '1900-01-01', toDate: toDate || '2100-01-01' },
            type: sequelize.QueryTypes.SELECT
          });
          filename = `revenue_report_${new Date().toISOString().split('T')[0]}`;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type. Valid types: shipments, users, revenue'
          });
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        return res.send(csv);
      }

      res.json({
        success: true,
        report: {
          type,
          generatedAt: new Date().toISOString(),
          recordCount: data.length,
          data
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

module.exports = AdminController;
