/**
 * Shipment CRUD & status history
 * URL prefix: /api/shipments
 */
const express = require('express');
const ShipmentController = require('../controllers/shipmentController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

<<<<<<< HEAD
// ----- Public (guest shipments) with optional authentication -----
router.post('/', optionalAuth, ShipmentController.createShipment);  // guest or authenticated
router.post('/calculate-cost', ShipmentController.calculateCost);  // public cost calculator
=======
// ----- Public (guest shipments) -----
router.post('/', optionalAuth, ShipmentController.createShipment);  // guest or authenticated
router.post('/calculate-cost', ShipmentController.calculateCost);  // cost calculation

// ----- Authenticated user only -----
router.get('/history', authenticateToken, ShipmentController.getShipmentHistory);
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343

// ----- Authenticated user / admin -----
router.use(authenticateToken);

router.get('/stats',          ShipmentController.getShipmentStats);        // Dashboard stats
router.get('/',               ShipmentController.getShipments);
router.get('/:id',            ShipmentController.getShipmentById);
router.put('/:id/status',     ShipmentController.updateShipmentStatus);    // users( cancel ) / admin
router.patch('/:id/status',   ShipmentController.updateShipmentStatus);    // users( cancel ) / admin - PATCH support
router.delete('/:id',         ShipmentController.deleteShipment);          // admin only

module.exports = router;
