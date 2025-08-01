const { Shipment, Country, BoxType, ShipmentStatus, ShipmentStatusHistory, CostAudit, User } = require('../models');
const CostCalculator = require('../services/costCalculator');
const Joi = require('joi');

const createShipmentSchema = Joi.object({
<<<<<<< HEAD
  receiverName: Joi.string().min(2).max(120).required(),
  weight: Joi.number().positive().required(),
  boxTypeId: Joi.number().integer().positive().required(),
  destinationCountryId: Joi.number().integer().positive().required(),
  destinationCity: Joi.string().min(1).max(100).required(),
  destinationAddress: Joi.string().min(1).max(255).required(),
  destinationZipCode: Joi.string().min(1).max(20).required()
=======
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
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
});

class ShipmentController {
  static async createShipment(req, res, next) {
    try {
<<<<<<< HEAD
      console.log('Incoming shipment data:', req.body);
      console.log('Request user:', req.user);
      console.log('Authorization header:', req.headers.authorization);
      
      const { error, value } = createShipmentSchema.validate(req.body);
=======
      const userId = req.user?.id;
      const isGuest = !userId;

      const { error, value } = createShipmentSchema.validate(req.body, { 
        context: { isGuest } 
      });
      
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details
        });
      }

      const { 
<<<<<<< HEAD
        receiverName, 
        weight,
        boxTypeId,
        destinationCountryId, 
        destinationCity,
        destinationAddress,
        destinationZipCode
      } = value;
      
      // Get user ID - only fallback to user ID 1 if this is a guest shipment (no authentication)
      const userId = req.user?.id;
      console.log('User from request:', req.user);
      console.log('User ID for shipment:', userId);
      
      if (!userId) {
        console.log('No authenticated user - this is a guest shipment');
      }

      // Use Supabase API if in API-only mode
      if (process.env.USE_SUPABASE_API_ONLY === 'true') {
        const { supabase } = require('../config/database');
        
        // Get box type and country data
        const [boxTypeResult, countryResult, statusResult] = await Promise.all([
          supabase.from('box_types').select('*').eq('id', boxTypeId).single(),
          supabase.from('countries').select('*').eq('id', destinationCountryId).single(),
          supabase.from('shipment_statuses').select('*').eq('code', 'pending').single()
        ]);

        console.log('Box type result:', boxTypeResult);
        console.log('Country result:', countryResult);
        console.log('Status result:', statusResult);

        if (boxTypeResult.error || countryResult.error || statusResult.error) {
          console.error('Database query errors:', {
            boxType: boxTypeResult.error,
            country: countryResult.error,
            status: statusResult.error
          });
          return res.status(400).json({
            success: false,
            message: 'Invalid box type, country, or status configuration'
          });
        }

        const boxType = boxTypeResult.data;
        const country = countryResult.data;
        const status = statusResult.data;

        // Calculate cost: base cost * country multiplier
        const baseCost = parseFloat(boxType.base_cost);
        const multiplier = parseFloat(country.multiplier);
        const totalCost = Math.round((baseCost * multiplier) * 100) / 100;

        // Generate tracking number
        const trackingNumber = 'BX' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

        console.log('Creating shipment with data:', {
          user_id: userId,
          tracking_number: trackingNumber,
          receiver_name: receiverName,
          receiver_address: destinationAddress,
          receiver_city: destinationCity,
          receiver_postal_code: destinationZipCode,
          receiver_country: country.name,
          country_id: destinationCountryId,
          box_type_id: boxTypeId,
          weight: weight,
          cost: totalCost,
          current_status_id: status.id
        });

        // Create shipment
        const { data: shipment, error: shipmentError } = await supabase
          .from('shipments')
          .insert({
            user_id: userId,
            tracking_number: trackingNumber,
            sender_name: 'Boxinator',
            sender_address: 'Main Street 123',
            sender_city: 'Stockholm',
            sender_postal_code: '12345',
            sender_country: 'Sweden',
            receiver_name: receiverName,
            receiver_address: destinationAddress,
            receiver_city: destinationCity,
            receiver_postal_code: destinationZipCode,
            receiver_country: country.name,
            country_id: destinationCountryId,
            box_type_id: boxTypeId,
            weight: weight,
            cost: totalCost,
            current_status_id: status.id
          })
          .select()
          .single();

        if (shipmentError) {
          console.error('Shipment creation error:', shipmentError);
          return res.status(400).json({
            success: false,
            message: 'Failed to create shipment',
            error: shipmentError.message
          });
        }

        return res.status(201).json({
          success: true,
          message: 'Shipment created successfully',
          data: {
            id: shipment.id,
            trackingId: shipment.tracking_number,
            cost: totalCost,
            ...shipment
          }
        });
      }

      // Fallback for non-Supabase mode (keeping original logic)
      // Get country and weight tier for cost calculation
      const [country, weightTier] = await Promise.all([
        Country.findByPk(destinationCountryId),
        WeightTier.findByPk(weightTierCode)
=======
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
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
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
<<<<<<< HEAD
        data: result
=======
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
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
      });
    } catch (error) {
      console.error('Shipment creation error:', error);
      next(error);
    }
  }

  static async getShipments(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.accountType || req.user.role;
      const { status, fromDate, toDate, limit } = req.query;

      // Use Supabase API if in API-only mode
      if (process.env.USE_SUPABASE_API_ONLY === 'true') {
        const { supabase } = require('../config/database');
        
        let query = supabase
          .from('shipments')
          .select(`
            *,
            countries!country_id (
              id,
              name,
              code
            ),
            box_types!box_type_id (
              id,
              name,
              size
            ),
            shipment_statuses!current_status_id (
              id,
              code,
              name
            )
          `)
          .order('created_at', { ascending: false });

        // Filter by user unless admin
        if (userRole !== 'admin') {
          query = query.eq('user_id', userId);
        }

        // Status filter
        if (status) {
          // Get status ID first
          const { data: statusData } = await supabase
            .from('shipment_statuses')
            .select('id')
            .eq('code', status)
            .single();
          
          if (statusData) {
            query = query.eq('current_status_id', statusData.id);
          }
        }

        // Date range filter
        if (fromDate) {
          query = query.gte('created_at', fromDate);
        }
        if (toDate) {
          query = query.lte('created_at', toDate);
        }

        // Limit results
        if (limit) {
          query = query.limit(parseInt(limit));
        }

        const { data: shipments, error } = await query;

        if (error) {
          console.error('Supabase shipments error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch shipments'
          });
        }

        return res.json({
          success: true,
          data: {
            shipments: (shipments || []).map(s => ({
              id: s.id,
              trackingId: s.tracking_number,
              tracking_number: s.tracking_number,
              destinationCountry: s.receiver_country,
              destinationCity: s.receiver_city,
              currentStatus: s.shipment_statuses?.code,
              status: s.shipment_statuses?.code,
              statusName: s.shipment_statuses?.name,
              totalCost: s.cost,
              cost: s.cost,
              createdAt: s.created_at,
              created_at: s.created_at,
              receiver_name: s.receiver_name,
              receiver_address: s.receiver_address,
              receiver_city: s.receiver_city,
              receiver_country: s.receiver_country,
              weight: s.weight,
              countries: s.countries,
              box_types: s.box_types,
              shipment_statuses: s.shipment_statuses
            }))
          }
        });
      }

      // Fallback to Sequelize (original code)
      let whereClause = {};
      
      // Filter by user unless admin
      if (userRole !== 'admin') {
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
        order: [['createdAt', 'DESC']],
        limit: limit ? parseInt(limit) : undefined
      });

      res.json({
        success: true,
        data: {
          shipments
        }
      });
    } catch (error) {
      console.error('Get shipments error:', error);
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
      const { statusCode, status, notes } = req.body;
      const userId = req.user.id;
      const userRole = req.user.accountType || req.user.role;
      const isAdmin = userRole === 'admin' || userRole === 'ADMINISTRATOR';

      console.log('Updating shipment status:', { id, statusCode, status, userId, userRole, isAdmin });

      // Use statusCode or status (frontend might send either)
      const newStatusCode = statusCode || status;

      if (!newStatusCode) {
        return res.status(400).json({
          success: false,
          message: 'Status code is required'
        });
      }

      // Use Supabase API if in API-only mode
      if (process.env.USE_SUPABASE_API_ONLY === 'true') {
        const { supabase } = require('../config/database');

        // First, get the shipment to check ownership
        const { data: shipment, error: shipmentError } = await supabase
          .from('shipments')
          .select('*')
          .eq('id', id)
          .single();

        if (shipmentError || !shipment) {
          return res.status(404).json({
            success: false,
            message: 'Shipment not found'
          });
        }

        console.log('Found shipment:', shipment);

        // Authorization check
        if (!isAdmin) {
          // Regular users can only cancel their own shipments
          if (shipment.user_id !== userId || !['cancelled', 'CANCELLED'].includes(newStatusCode)) {
            return res.status(403).json({
              success: false,
              message: 'Insufficient permissions. You can only cancel your own shipments.'
            });
          }
        }

        // Get the status ID from status code
        console.log('Looking up status code:', newStatusCode.toLowerCase());
        
        const { data: statusData, error: statusError } = await supabase
          .from('shipment_statuses')
          .select('*')
          .eq('code', newStatusCode.toLowerCase())
          .single();

        console.log('Status lookup result:', { statusData, statusError });

        if (statusError || !statusData) {
          console.error('Status lookup error:', statusError);
          console.error('Available statuses query:');
          const { data: allStatuses } = await supabase.from('shipment_statuses').select('*');
          console.error('All statuses:', allStatuses);
          return res.status(400).json({
            success: false,
            message: 'Invalid status code',
            debug: {
              requestedStatus: newStatusCode.toLowerCase(),
              error: statusError?.message,
              availableStatuses: allStatuses?.map(s => s.code)
            }
          });
        }

        console.log('Found status:', statusData);

        // Update the shipment status
        const { data: updatedShipment, error: updateError } = await supabase
          .from('shipments')
          .update({
            current_status_id: statusData.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          return res.status(500).json({
            success: false,
            message: 'Failed to update shipment status'
          });
        }

        console.log('Updated shipment:', updatedShipment);

        // TODO: Add status history tracking if needed
        // const { error: historyError } = await supabase
        //   .from('shipment_status_history')
        //   .insert({
        //     shipment_id: id,
        //     status_id: statusData.id,
        //     changed_by_user_id: userId,
        //     notes: notes || null,
        //     changed_at: new Date().toISOString()
        //   });

        return res.json({
          success: true,
          message: 'Shipment status updated successfully',
          data: {
            id: updatedShipment.id,
            tracking_number: updatedShipment.tracking_number,
            status: statusData.code,
            statusName: statusData.name,
            updated_at: updatedShipment.updated_at
          }
        });
      }

      // Fallback to Sequelize mode
      // Validate status code
      const validStatus = await ShipmentStatus.findByPk(newStatusCode);
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
        if (shipment.userId !== userId || newStatusCode !== 'CANCELLED') {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
        }
      }

      // Update in transaction
      await sequelize.transaction(async (t) => {
        await shipment.update(
          { currentStatusCode: newStatusCode },
          { transaction: t }
        );

        await ShipmentStatusHistory.create({
          shipmentId: shipment.id,
          statusCode: newStatusCode,
          changedByUserId: userId,
          notes
        }, { transaction: t });
      });

      res.json({
        success: true,
        message: 'Shipment status updated successfully'
      });
    } catch (error) {
      console.error('Update shipment status error:', error);
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

  static async getShipmentStats(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.accountType || req.user.role;

      // Use Supabase API if in API-only mode
      if (process.env.USE_SUPABASE_API_ONLY === 'true') {
        const { supabase } = require('../config/database');
        
        let statsQuery = supabase
          .from('shipments')
          .select(`
            *,
            shipment_statuses!current_status_id (
              id,
              code,
              name
            )
          `);

        // If not admin, filter by user
        if (userRole !== 'admin') {
          statsQuery = statsQuery.eq('user_id', userId);
        }

        // Execute the query
        const { data: shipments, error } = await statsQuery;
        
        if (error) {
          console.error('Supabase stats error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch shipment statistics'
          });
        }
        
        // Calculate stats from the data
        const totalShipments = shipments.length;
        const completedShipments = shipments.filter(s => 
          s.shipment_statuses?.code === 'delivered'
        ).length;
        const pendingShipments = shipments.filter(s => 
          ['pending', 'in_transit'].includes(s.shipment_statuses?.code)
        ).length;
        const cancelledShipments = shipments.filter(s => 
          s.shipment_statuses?.code === 'cancelled'
        ).length;
        const totalRevenue = shipments.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);
        
        return res.json({
          success: true,
          data: {
            totalShipments,
            completedShipments,
            pendingShipments,
            cancelledShipments,
            deliveredShipments: completedShipments, // Frontend expects deliveredShipments
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalSpent: Math.round(totalRevenue * 100) / 100, // Frontend expects totalSpent
            recentShipments: shipments.slice(0, 5).map(s => ({
              id: s.id,
              trackingId: s.tracking_number,
              tracking_number: s.tracking_number,
              destinationCountry: s.receiver_country,
              destinationCity: s.receiver_city,
              currentStatus: s.shipment_statuses?.code,
              status: s.shipment_statuses?.code,
              statusName: s.shipment_statuses?.name,
              totalCost: s.cost,
              cost: s.cost,
              createdAt: s.created_at,
              created_at: s.created_at,
              receiver_name: s.receiver_name,
              receiver_city: s.receiver_city,
              receiver_country: s.receiver_country
            })) // Last 5 shipments with status info
          }
        });
      }
      
      // Original Sequelize logic (fallback)
      const whereClause = userRole === 'admin' ? {} : { userId };
      
      const [
        totalCount,
        completedCount,
        pendingCount,
        cancelledCount,
        revenueResult,
        recentShipments
      ] = await Promise.all([
        Shipment.count({ where: whereClause }),
        Shipment.count({ where: { ...whereClause, status: 'DELIVERED' } }),
        Shipment.count({ where: { ...whereClause, status: ['PENDING', 'IN_TRANSIT'] } }),
        Shipment.count({ where: { ...whereClause, status: 'CANCELLED' } }),
        Shipment.sum('cost', { where: whereClause }),
        Shipment.findAll({
          where: whereClause,
          order: [['createdAt', 'DESC']],
          limit: 5,
          include: [{ model: Country, attributes: ['name'] }]
        })
      ]);

      res.json({
        success: true,
        data: {
          totalShipments: totalCount,
          completedShipments: completedCount,
          pendingShipments: pendingCount,
          cancelledShipments: cancelledCount,
          totalRevenue: Math.round((revenueResult || 0) * 100) / 100,
          recentShipments
        }
      });
    } catch (error) {
      console.error('Stats error:', error);
      next(error);
    }
  }

  static async calculateCost(req, res, next) {
    try {
      const { boxTypeId, countryId, weight } = req.body;

      console.log('Incoming payload:', { boxTypeId, countryId, weight });

      if (!boxTypeId || !countryId) {
        return res.status(400).json({
          success: false,
          message: 'Box type and destination country are required'
        });
      }

      if (process.env.USE_SUPABASE_API_ONLY === 'true') {
        const { supabase } = require('../config/database');

        const [boxTypeResult, countryResult] = await Promise.all([
          supabase.from('box_types').select('*').eq('id', boxTypeId).single(),
          supabase.from('countries').select('*').eq('id', countryId).single()
        ]);

        console.log('Box type result:', boxTypeResult);
        console.log('Country result:', countryResult);

        if (boxTypeResult.error || countryResult.error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid box type or country'
          });
        }

        const boxType = boxTypeResult.data;
        const country = countryResult.data;

        if (!boxType || !country) {
          return res.status(400).json({
            success: false,
            message: 'Box type or country not found'
          });
        }

        const baseCost = parseFloat(boxType.base_cost);
        const multiplier = parseFloat(country.multiplier);
        const finalCost = Math.round((baseCost * multiplier) * 100) / 100;

        return res.json({
          success: true,
          data: {
            cost: finalCost,
            baseCost,
            multiplier,
            boxType: boxType.name,
            country: country.name,
            breakdown: {
              boxType: `${boxType.name} (${boxType.size})`,
              baseCost: `$${baseCost}`,
              destination: country.name,
              multiplier: `${multiplier}x`,
              finalCost: `$${finalCost}`
            }
          }
        });
      } else {
        const [boxType, country] = await Promise.all([
          BoxType.findByPk(boxTypeId),
          Country.findByPk(countryId)
        ]);

        console.log('Box type:', boxType);
        console.log('Country:', country);

        if (!boxType || !country) {
          return res.status(400).json({
            success: false,
            message: 'Invalid box type or country'
          });
        }

        const baseCost = parseFloat(boxType.baseCost);
        const multiplier = parseFloat(country.multiplier);
        const finalCost = Math.round((baseCost * multiplier) * 100) / 100;

        return res.json({
          success: true,
          data: {
            cost: finalCost,
            baseCost,
            multiplier,
            boxType: boxType.name,
            country: country.name,
            breakdown: {
              boxType: `${boxType.name}`,
              baseCost: `$${baseCost}`,
              destination: country.name,
              multiplier: `${multiplier}x`,
              finalCost: `$${finalCost}`
            }
          }
        });
      }
    } catch (error) {
      console.error('Cost calculation error:', error);
      next(error);
    }
  }
}

module.exports = ShipmentController;
