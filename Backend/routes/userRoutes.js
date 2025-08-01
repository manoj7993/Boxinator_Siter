/**
 * User account management
 * URL prefix: /api/account
 */
const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);           // all routes below require a valid JWT

router.get('/:id',         UserController.getProfile);
router.put('/:id',         UserController.updateProfile);
router.put('/:id/password', UserController.changePassword);
router.delete('/:id',       UserController.deleteAccount);   // admin only (checked inside controller)

module.exports = router;
