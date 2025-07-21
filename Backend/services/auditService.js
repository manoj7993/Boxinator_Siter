// src/services/auditService.js
const { AdminActionLog, User, UserProfile } = require('../models');

class AuditService {
  /**
   * Log admin action
   */
  static async logAdminAction(actorUserId, actionType, description, metadata = {}) {
    try {
      const log = await AdminActionLog.create({
        actorUserId,
        actionType,
        description,
        metadata: JSON.stringify(metadata),
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null
      });

      return log;
    } catch (error) {
      console.error('Failed to log admin action:', error);
      throw new Error('Failed to log admin action');
    }
  }

  /**
   * Get admin action logs
   */
  static async getAdminLogs(options = {}) {
    const { page = 1, limit = 50, actorUserId, actionType, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (actorUserId) {
      whereClause.actorUserId = actorUserId;
    }
    
    if (actionType) {
      whereClause.actionType = actionType;
    }
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const result = await AdminActionLog.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'actor',
          attributes: ['id', 'email'],
          include: [
            { 
              model: UserProfile, 
              as: 'profile',
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      logs: result.rows,
      total: result.count,
      page,
      pages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Get action types for filtering
   */
  static getActionTypes() {
    return [
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'UPDATE_USER_ROLE',
      'CREATE_SHIPMENT',
      'UPDATE_SHIPMENT_STATUS',
      'DELETE_SHIPMENT',
      'UPDATE_COUNTRY_MULTIPLIER',
      'CREATE_COUNTRY',
      'EXPORT_REPORT',
      'BULK_UPDATE',
      'SYSTEM_MAINTENANCE'
    ];
  }

  /**
   * Get audit statistics
   */
  static async getAuditStats(dateRange = {}) {
    const { startDate, endDate } = dateRange;
    const whereClause = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const stats = await AdminActionLog.findAll({
      where: whereClause,
      attributes: [
        'actionType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['actionType'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });

    const totalActions = await AdminActionLog.count({ where: whereClause });
    
    const uniqueActors = await AdminActionLog.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('actorUserId'))), 'count']
      ],
      raw: true
    });

    return {
      totalActions,
      uniqueActors: uniqueActors[0]?.count || 0,
      actionsByType: stats
    };
  }

  /**
   * Get user activity (actions performed by specific user)
   */
  static async getUserActivity(userId, options = {}) {
    const { page = 1, limit = 20, actionType } = options;
    const offset = (page - 1) * limit;

    const whereClause = { actorUserId: userId };
    
    if (actionType) {
      whereClause.actionType = actionType;
    }

    const result = await AdminActionLog.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'actionType', 'description', 'metadata', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      activities: result.rows,
      total: result.count,
      page,
      pages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Export audit logs to CSV format
   */
  static async exportAuditLogs(options = {}) {
    const { startDate, endDate, actionType } = options;
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    if (actionType) {
      whereClause.actionType = actionType;
    }

    const logs = await AdminActionLog.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'actor',
          attributes: ['email'],
          include: [
            { 
              model: UserProfile, 
              as: 'profile',
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Convert to CSV format
    const headers = ['Date', 'Actor', 'Action Type', 'Description', 'IP Address'];
    const rows = logs.map(log => [
      log.createdAt.toISOString(),
      `${log.actor?.profile?.firstName || ''} ${log.actor?.profile?.lastName || ''} (${log.actor?.email || 'Unknown'})`.trim(),
      log.actionType,
      log.description,
      log.ipAddress || 'N/A'
    ]);

    return {
      headers,
      rows,
      totalRecords: logs.length
    };
  }

  /**
   * Clean up old audit logs
   */
  static async cleanupOldLogs(daysToKeep = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await AdminActionLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      }
    });

    await this.logAdminAction(
      null, // System action
      'SYSTEM_MAINTENANCE',
      `Cleaned up ${deletedCount} old audit log entries`,
      { deletedCount, cutoffDate }
    );

    return deletedCount;
  }

  /**
   * Search audit logs
   */
  static async searchAuditLogs(searchTerm, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const result = await AdminActionLog.findAndCountAll({
      where: {
        [Op.or]: [
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { actionType: { [Op.iLike]: `%${searchTerm}%` } },
          { '$actor.email$': { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      include: [
        { 
          model: User, 
          as: 'actor',
          attributes: ['email'],
          include: [
            { 
              model: UserProfile, 
              as: 'profile',
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      logs: result.rows,
      total: result.count,
      page,
      pages: Math.ceil(result.count / limit)
    };
  }
}

module.exports = AuditService;
