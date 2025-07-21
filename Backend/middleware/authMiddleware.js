/**
 * Authentication & authorization helpers.
 * - authenticateToken:  verifies JWT and attaches user to req
 * - requireAdmin:       blocks non-administrators
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token       = authHeader.split(' ')[1];          // “Bearer <token>”

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    /* attach context */
    req.user = {
      id:           user.id,
      email:        user.email,
      accountType:  user.accountType
    };
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.accountType !== 'ADMINISTRATOR') {
    return res.status(403).json({
      success: false,
      message: 'Administrator access required'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};
