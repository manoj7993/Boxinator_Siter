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
  const token       = authHeader.split(' ')[1];          // "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    /* attach context */
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      address: user.address,
      phone: user.phone,
      role: user.role || 'user'
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
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Administrator access required'
    });
  }
  next();
};

/**
 * Optional authentication - allows both guests and authenticated users
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue as guest
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        address: user.address,
        phone: user.phone,
        role: user.role || 'user'
      };
    } else {
      req.user = null;
    }
  } catch (err) {
    // Invalid token, continue as guest
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
