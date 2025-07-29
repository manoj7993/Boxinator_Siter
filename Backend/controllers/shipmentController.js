const { Shipment, Country, BoxType, ShipmentStatus, ShipmentStatusHistory, CostAudit, User } = require('../models');
const CostCalculator = require('../services/costCalculator');
const Joi = require('joi');

const createShipmentSchema = Joi.object({
  // Sender info (required for guest users, optional for registered users)
  senderName: Joi.string().min(2).max(100).when('$isGuest', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  senderEmail: Joi.string().email().when('$isGuest', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  senderPhone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).when('$isGuest', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  senderAddress: Joi.string().min(5).max(500).when('$isGuest', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  senderCity: Joi.string().min(2).max(100).when('$isGuest', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  senderPostalCode: Joi.string().min(2).max(20).when('$isGuest', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  senderCountry: Joi.string().min(2).max(100).when('$isGuest', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  
  // Receiver info (always required)
  receiverName: Joi.string().min(2).max(100).required(),
  receiverEmail: Joi.string().email().required(),
  receiverPhone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required(),
  receiverAddress: Joi.string().min(5).max(500).required(),
  receiverCity: Joi.string().min(2).max(100).required(),
  receiverPostalCode: Joi.string().min(2).max(20).required(),
  receiverCountry: Joi.string().min(2).max(100).required(),
  
  // Box and destination
  boxTypeId: Joi.number().integer().positive().required(),
  countryId: Joi.number().integer().positive().required()
});

class ShipmentController {
  static async createShipment(req, res, next) {
    try {
      const userId = req.user?.id;
      const isGuest = !userId;

      const { error, value } = createShipmentSchema.validate(req.body, { 
        context: { isGuest } 
      });
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details
        });
      }

      const { 
        senderName, senderEmail, senderPhone, senderAddress, senderCity, senderPostalCode, senderCountry,
        receiverName, receiverEmail, receiverPhone, receiverAddress, receiverCity, receiverPostalCode, receiverCountry,
        boxTypeId, countryId 
      } = value;

      // Get user data if registered user
      let senderData = {};
      if (!isGuest) {
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
        senderData = {
          senderName: user.name,
          senderEmail: user.email,
          senderPhone: user.phone,
          senderAddress: user.address,
          senderCity: user.address.split(',')[1]?.trim() || 'Not specified',
          senderPostalCode: 'Not specified',
          senderCountry: user.address.split(',').pop()?.trim() || 'Not specified'
        };
      } else {
        senderData = {
          senderName, senderEmail, senderPhone, senderAddress, senderCity, senderPostalCode, senderCountry
        };
      }

      // Get country and box type for cost calculation
      const [country, boxType] = await Promise.all([
        Country.findByPk(countryId),
        BoxType.findByPk(boxTypeId)
      ]);

      if (!country || !boxType) {
        return res.status(400).json({
          success: false,
          message: 'Invalid country or box type'
        });
      }

      // Calculate shipping cost
      const cost = parseFloat((boxType.baseCost * country.multiplier).toFixed(2));

      // Generate tracking number
      const trackingNumber = 'BX' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

      // Create shipment
      const shipment = await Shipment.create({
        userId: userId || null,
        guestEmail: isGuest ? senderEmail : null,
        trackingNumber,
        ...senderData,
        receiverName,
        receiverEmail,
        receiverPhone,
        receiverAddress,
        receiverCity,
        receiverPostalCode,
        receiverCountry,
        boxTypeId,
        countryId,
        cost,
        currentStatusId: 1 // Assuming 1 is 'Created' status
      });

      res.status(201).json({
        success: true,
        message: 'Shipment created successfully',
        shipment: {
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          cost: shipment.cost,
          boxType: boxType.name,
          destination: country.name,
          receiver: receiverName
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getShipmentHistory(req, res, next) {
    try {
      const userId = req.user.id;

      const shipments = await Shipment.findAll({
        where: { userId },
        include: [
          { model: Country, as: 'country' },
          { model: BoxType, as: 'boxType' }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        shipments: shipments.map(shipment => ({
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          receiverName: shipment.receiverName,
          destination: shipment.country.name,
          boxType: shipment.boxType.name,
          cost: shipment.cost,
          date: shipment.createdAt
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  static async calculateCost(req, res, next) {
    try {
      const { boxTypeId, countryId } = req.body;

      if (!boxTypeId || !countryId) {
        return res.status(400).json({
          success: false,
          message: 'Box type and country are required'
        });
      }

      const [country, boxType] = await Promise.all([
        Country.findByPk(countryId),
        BoxType.findByPk(boxTypeId)
      ]);

      if (!country || !boxType) {
        return res.status(400).json({
          success: false,
          message: 'Invalid country or box type'
        });
      }

      const cost = parseFloat((boxType.baseCost * country.multiplier).toFixed(2));

      res.json({
        success: true,
        cost,
        boxType: boxType.name,
        country: country.name,
        baseCost: boxType.baseCost,
        multiplier: country.multiplier
      });
    } catch (error) {
      next(error);
    }
  }

  static async getShipments(req, res, next) {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.accountType === 'ADMINISTRATOR';
      const { status, fromDate, toDate } = req.query;

      let whereClause = {};
      
      // Filter by user unless admin
      if (!isAdmin) {
        whereClause.userId = userId;
      }

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

      const shipments = await Shipment.findAll({
        where: whereClause,
        include: [
          { model: Country, as: 'destinationCountry' },
          { model: WeightTier, as: 'weightTier' },
          { model: ShipmentStatus, as: 'currentStatus' }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        shipments
      });
    } catch (error) {
      next(error);
    }
  }

  static async getShipmentById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.accountType === 'ADMINISTRATOR';

      let whereClause = { id };
      
      // Non-admin users can only see their own shipments
      if (!isAdmin) {
        whereClause.userId = userId;
      }

      const shipment = await Shipment.findOne({
        where: whereClause,
        include: [
          { model: Country, as: 'destinationCountry' },
          { model: WeightTier, as: 'weightTier' },
          { model: ShipmentStatus, as: 'currentStatus' },
          { 
            model: ShipmentStatusHistory, 
            as: 'statusHistory',
            include: [{ model: ShipmentStatus, as: 'status' }],
            order: [['changedAt', 'DESC']]
          }
        ]
      });

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      res.json({
        success: true,
        shipment
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateShipmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { statusCode, notes } = req.body;
      const userId = req.user.id;
      const isAdmin = req.user.accountType === 'ADMINISTRATOR';

      // Validate status code
      const validStatus = await ShipmentStatus.findByPk(statusCode);
      if (!validStatus) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status code'
        });
      }

      const shipment = await Shipment.findByPk(id);
      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      // Authorization check
      if (!isAdmin) {
        // Regular users can only cancel their own shipments
        if (shipment.userId !== userId || statusCode !== 'CANCELLED') {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
        }
      }

      // Update in transaction
      await sequelize.transaction(async (t) => {
        await shipment.update(
          { currentStatusCode: statusCode },
          { transaction: t }
        );

        await ShipmentStatusHistory.create({
          shipmentId: shipment.id,
          statusCode,
          changedByUserId: userId,
          notes
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

  static async deleteShipment(req, res, next) {
    try {
      const { id } = req.params;
      
      // Only administrators can delete shipments
      if (req.user.accountType !== 'ADMINISTRATOR') {
        return res.status(403).json({
          success: false,
          message: 'Administrator access required'
        });
      }

      const deleted = await Shipment.destroy({ where: { id } });
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      res.json({
        success: true,
        message: 'Shipment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ShipmentController;
