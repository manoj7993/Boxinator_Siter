/**
 * Shipment CRUD & status history
 * URL prefix: /api/shipments
 */
const express = require('express');
const ShipmentController = require('../controllers/shipmentController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// ----- Public (guest shipments) -----
router.post('/', optionalAuth, ShipmentController.createShipment);  // guest or authenticated
router.post('/calculate-cost', ShipmentController.calculateCost);  // cost calculation

// ----- Authenticated user only -----
router.get('/history', authenticateToken, ShipmentController.getShipmentHistory);

// ----- Authenticated user / admin -----
router.use(authenticateToken);

router.get('/stats',          ShipmentController.getShipmentStats);        // Dashboard stats
router.get('/',               ShipmentController.getShipments);
router.get('/:id',            ShipmentController.getShipmentById);
router.put('/:id/status',     ShipmentController.updateShipmentStatus);    // users( cancel ) / admin
router.patch('/:id/status',   ShipmentController.updateShipmentStatus);    // users( cancel ) / admin - PATCH support
router.delete('/:id',         ShipmentController.deleteShipment);          // admin only

module.exports = router;
