/**
 * Administrator-only endpoints
 * URL prefix: /api/admin
 */
const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Global middleware: must be logged-in AND have ADMINISTRATOR role
router.use(authenticateToken, requireAdmin);

// ----- Dashboard, analytics & logs -----
router.get('/dashboard', AdminController.getDashboard);
router.get('/analytics', AdminController.getAnalytics);
router.get('/logs',      AdminController.getAdminLogs);

// ----- Shipments -----
router.get('/shipments',                 AdminController.getAllShipments);
router.put('/shipments/:id/status',      AdminController.updateShipmentStatus);

// ----- Users -----
router.get('/users',           AdminController.getAllUsers);
router.put('/users/:id/role',  AdminController.updateUserRole);
router.delete('/users/:id',    AdminController.deleteUser);

// ----- Reports & data export -----
router.get('/reports/export',  AdminController.exportReport);

module.exports = router;
