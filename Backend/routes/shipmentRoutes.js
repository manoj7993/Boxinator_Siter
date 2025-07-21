/**
 * Shipment CRUD & status history
 * URL prefix: /api/shipments
 */
const express = require('express');
const ShipmentController = require('../controllers/shipmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// ----- Public (guest shipments) -----
router.post('/', ShipmentController.createShipment);  // guest or authenticated

// ----- Authenticated user / admin -----
router.use(authenticateToken);

router.get('/',               ShipmentController.getShipments);
// TODO: Implement these optional helper methods in controller
// router.get('/complete',       ShipmentController.getCompletedShipments);   // optional helper
// router.get('/cancelled',      ShipmentController.getCancelledShipments);   // optional helper
router.get('/:id',            ShipmentController.getShipmentById);
router.put('/:id/status',     ShipmentController.updateShipmentStatus);    // users( cancel ) / admin
router.delete('/:id',         ShipmentController.deleteShipment);          // admin only

module.exports = router;
