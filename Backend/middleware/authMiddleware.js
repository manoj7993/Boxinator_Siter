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
<<<<<<< HEAD
    
    let user;
    
    // Use Supabase API if in API-only mode
    if (process.env.USE_SUPABASE_API_ONLY === 'true') {
      const { supabase } = require('../config/database');
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', decoded.id || decoded.userId)
        .single();
      
      if (error || !userData) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token - user not found'
        });
      }
      
      user = userData;
    } else {
      // Original Sequelize logic
      user = await User.findByPk(decoded.id || decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
=======
    const user    = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
    }

    /* attach context */
    req.user = {
      id:           user.id,
      email:        user.email,
<<<<<<< HEAD
      role:         user.role,
      accountType:  user.role // For compatibility
=======
      name:         user.name,
      address:      user.address,
      phone:        user.phone,
      role:         user.role || 'user'
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
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

<<<<<<< HEAD
// Optional authentication - sets req.user if token is provided, but doesn't fail if missing
=======
/**
 * Optional authentication - allows both guests and authenticated users
 */
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
<<<<<<< HEAD
    // No token provided - continue as guest
=======
    // No token provided, continue as guest
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
<<<<<<< HEAD
    
    // Use Supabase API if in API-only mode
    if (process.env.USE_SUPABASE_API_ONLY === 'true') {
      const { supabase } = require('../config/database');
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', decoded.id || decoded.userId)
        .single();
      
      if (error || !userData) {
        // Invalid token - continue as guest
        req.user = null;
      } else {
        req.user = {
          id: userData.id,
          email: userData.email,
          accountType: userData.role || 'customer',
          role: userData.role || 'customer'
        };
      }
    } else {
      // Original Sequelize logic
      const user = await User.findByPk(decoded.id || decoded.userId);
      
      if (!user) {
        req.user = null;
      } else {
        req.user = {
          id: user.id,
          email: user.email,
          accountType: user.accountType || 'customer',
          role: user.accountType || 'customer'
        };
      }
    }
  } catch (error) {
    // Invalid token - continue as guest
    req.user = null;
  }
  
=======
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

>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
