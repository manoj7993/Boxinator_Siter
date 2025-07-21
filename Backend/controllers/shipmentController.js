const { Shipment, Country, WeightTier, ShipmentStatus, ShipmentStatusHistory, CostAudit } = require('../models');
const CostCalculator = require('../services/costCalculator');
const Joi = require('joi');

const createShipmentSchema = Joi.object({
  receiverName: Joi.string().min(2).max(120).required(),
  destinationCountryId: Joi.number().integer().positive().required(),
  weightTierCode: Joi.string().valid('BASIC', 'HUMBLE', 'DELUXE', 'PREMIUM').required(),
  boxColor: Joi.string().pattern(/^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6})$/).required(),
  guestEmail: Joi.string().email().optional()
});

class ShipmentController {
  static async createShipment(req, res, next) {
    try {
      const { error, value } = createShipmentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details
        });
      }

      const { receiverName, destinationCountryId, weightTierCode, boxColor, guestEmail } = value;
      const userId = req.user?.id;

      // Validate guest email requirement
      if (!userId && !guestEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is required for guest shipments'
        });
      }

      // Get country and weight tier for cost calculation
      const [country, weightTier] = await Promise.all([
        Country.findByPk(destinationCountryId),
        WeightTier.findByPk(weightTierCode)
      ]);

      if (!country || !weightTier) {
        return res.status(400).json({
          success: false,
          message: 'Invalid country or weight tier'
        });
      }

      // Calculate shipping cost
      const cost = CostCalculator.calculateShippingCost(
        weightTierCode,
        country.multiplier,
        country.isSourceCountry
      );

      // Create shipment in transaction
      const result = await sequelize.transaction(async (t) => {
        const shipment = await Shipment.create({
          userId: userId || null,
          guestEmail: guestEmail || null,
          receiverName,
          destinationCountryId,
          weightTierCode,
          boxColor,
          cost,
          currentStatusCode: 'CREATED'
        }, { transaction: t });

        // Create initial status history
        await ShipmentStatusHistory.create({
          shipmentId: shipment.id,
          statusCode: 'CREATED',
          changedByUserId: userId || null
        }, { transaction: t });

        // Create cost audit record
        await CostAudit.create({
          shipmentId: shipment.id,
          flatFee: 200,
          multiplier: country.multiplier,
          weight: weightTier.weight,
          totalCost: cost
        }, { transaction: t });

        return shipment;
      });

      // Send confirmation email
      const email = userId ? req.user.email : guestEmail;
      await emailService.sendShipmentConfirmation(email, result, cost);

      res.status(201).json({
        success: true,
        message: 'Shipment created successfully',
        shipment: result,
        totalCost: cost
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
