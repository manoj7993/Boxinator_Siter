/**
 * Authentication & token-related endpoints
 * URL prefix: /api/auth
 */
const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Handle preflight requests for all auth routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ----- Public -----
router.post('/register', authLimiter, AuthController.register);
router.post('/login',  authLimiter, AuthController.login);
router.get ('/verify/:token', AuthController.verifyEmail);

// ----- Protected (require valid JWT) -----
// TODO: Implement these methods in AuthController
// router.post('/logout', authenticateToken, AuthController.logout);         // optional
// router.post('/refresh', AuthController.refreshToken);                     // if using refresh flow
// router.post('/password/forgot', AuthController.forgotPassword);           // optional
// router.post('/password/reset/:token', AuthController.resetPassword);      // optional

module.exports = router;
