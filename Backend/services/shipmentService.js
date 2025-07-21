// src/services/shipmentService.js
const { Shipment, Country, WeightTier, ShipmentStatus, ShipmentStatusHistory, User, UserProfile } = require('../models');
const CostCalculator = require('./costCalculator');
const emailService = require('./emailService');
const auditService = require('./auditService');

class ShipmentService {
  /**
   * Create a new shipment
   */
  static async createShipment(shipmentData, userId = null) {
    const { destinationCountryId, weightTierCode, receiverName, boxColor, guestEmail } = shipmentData;

    // Calculate cost
    const costDetails = await CostCalculator.calculateCost(destinationCountryId, weightTierCode);

    // Create shipment
    const shipment = await Shipment.create({
      userId,
      destinationCountryId,
      weightTierCode,
      receiverName,
      boxColor,
      guestEmail,
      totalCost: costDetails.finalCost,
      currentStatusCode: 'CREATED'
    });

    // Create initial status history
    await ShipmentStatusHistory.create({
      shipmentId: shipment.id,
      statusCode: 'CREATED',
      changedByUserId: userId,
      notes: 'Shipment created'
    });

    // Send notification if guest email provided
    if (guestEmail) {
      try {
        await emailService.sendShipmentStatusEmail(guestEmail, shipment, 'CREATED');
      } catch (error) {
        console.error('Failed to send shipment notification:', error);
      }
    }

    return {
      shipment,
      costDetails
    };
  }

  /**
   * Get shipments for a user
   */
  static async getUserShipments(userId, options = {}) {
    const { page = 1, limit = 10, status, search } = options;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    
    if (status) {
      whereClause.currentStatusCode = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { receiverName: { [Op.iLike]: `%${search}%` } },
        { '$Country.name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const result = await Shipment.findAndCountAll({
      where: whereClause,
      include: [
        { model: Country, as: 'destinationCountry' },
        { model: ShipmentStatus, as: 'currentStatus' }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      shipments: result.rows,
      total: result.count,
      page,
      pages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Get shipment by ID
   */
  static async getShipmentById(shipmentId, userId = null) {
    const whereClause = { id: shipmentId };
    
    // If userId provided, ensure user owns the shipment or is admin
    if (userId) {
      const user = await User.findByPk(userId);
      if (user.accountType !== 'ADMINISTRATOR') {
        whereClause.userId = userId;
      }
    }

    const shipment = await Shipment.findOne({
      where: whereClause,
      include: [
        { model: Country, as: 'destinationCountry' },
        { model: ShipmentStatus, as: 'currentStatus' },
        { 
          model: ShipmentStatusHistory, 
          as: 'statusHistory',
          order: [['createdAt', 'DESC']],
          include: [
            { model: User, as: 'changedBy', include: [{ model: UserProfile, as: 'profile' }] }
          ]
        }
      ]
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    return shipment;
  }

  /**
   * Update shipment status
   */
  static async updateShipmentStatus(shipmentId, newStatusCode, changedByUserId, notes = '') {
    const shipment = await Shipment.findByPk(shipmentId, {
      include: [{ model: Country, as: 'destinationCountry' }]
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Validate status transition
    const isValidTransition = this.validateStatusTransition(shipment.currentStatusCode, newStatusCode);
    if (!isValidTransition) {
      throw new Error(`Invalid status transition from ${shipment.currentStatusCode} to ${newStatusCode}`);
    }

    // Update shipment status
    await shipment.update({ currentStatusCode: newStatusCode });

    // Create status history record
    await ShipmentStatusHistory.create({
      shipmentId,
      statusCode: newStatusCode,
      changedByUserId,
      notes
    });

    // Send notification
    const notificationEmail = shipment.userId ? 
      (await User.findByPk(shipment.userId)).email : 
      shipment.guestEmail;

    if (notificationEmail) {
      try {
        await emailService.sendShipmentStatusEmail(notificationEmail, shipment, newStatusCode);
      } catch (error) {
        console.error('Failed to send status notification:', error);
      }
    }

    // Log admin action if changed by admin
    if (changedByUserId) {
      await auditService.logAdminAction(
        changedByUserId,
        'UPDATE_SHIPMENT_STATUS',
        `Updated shipment ${shipmentId} status to ${newStatusCode}`,
        { shipmentId, oldStatus: shipment.currentStatusCode, newStatus: newStatusCode }
      );
    }

    return shipment;
  }

  /**
   * Validate status transition
   */
  static validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      'CREATED': ['RECEIVED', 'CANCELLED'],
      'RECEIVED': ['DISPATCHED', 'CANCELLED'],
      'DISPATCHED': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [], // Final state
      'CANCELLED': [] // Final state
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Delete shipment (admin only)
   */
  static async deleteShipment(shipmentId, deletedByUserId) {
    const shipment = await Shipment.findByPk(shipmentId);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Only allow deletion if not delivered
    if (shipment.currentStatusCode === 'DELIVERED') {
      throw new Error('Cannot delete delivered shipments');
    }

    await shipment.destroy();

    // Log admin action
    await auditService.logAdminAction(
      deletedByUserId,
      'DELETE_SHIPMENT',
      `Deleted shipment ${shipmentId}`,
      { shipmentId, status: shipment.currentStatusCode }
    );

    return true;
  }

  /**
   * Get shipment statistics
   */
  static async getShipmentStats(dateRange = {}) {
    const { startDate, endDate } = dateRange;
    const whereClause = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const stats = await Shipment.findAll({
      where: whereClause,
      attributes: [
        'currentStatusCode',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalRevenue']
      ],
      group: ['currentStatusCode'],
      raw: true
    });

    return stats;
  }

  /**
   * Track shipment by ID (public)
   */
  static async trackShipment(shipmentId) {
    const shipment = await Shipment.findByPk(shipmentId, {
      attributes: ['id', 'receiverName', 'currentStatusCode', 'createdAt'],
      include: [
        { model: Country, as: 'destinationCountry', attributes: ['name'] },
        { 
          model: ShipmentStatusHistory, 
          as: 'statusHistory',
          attributes: ['statusCode', 'createdAt', 'notes'],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    return shipment;
  }
}

module.exports = ShipmentService;
