// backend/server.js - Consolidated Express Server
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { escape } = require('lodash');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const Joi = require('joi');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== DATABASE CONFIGURATION =====
const sequelize = new Sequelize(
  process.env.DB_NAME || 'Boxinator1',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// ===== RATE LIMITERS =====
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,          // 15 min window
  max: 100,                          // 100 requests / IP
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,          // tighter window for auth
  max: 5,                            // 5 login/registration attempts
  message: 'Too many attempts, try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// ===== MIDDLEWARE FUNCTIONS =====
const sanitizeInput = (req, _res, next) => {
  const traverse = (obj) => {
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (typeof val === 'string') obj[key] = escape(val);
      else if (typeof val === 'object' && val !== null) traverse(val);
    });
  };

  if (req.body) traverse(req.body);
  if (req.query) traverse(req.query);
  if (req.params) traverse(req.params);
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// ===== VALIDATION SCHEMAS =====
const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  dateOfBirth: Joi.date().optional(),
  countryOfResidence: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  contactNumber: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// ===== SECURITY MIDDLEWARE =====
app.use(helmet());
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true 
}));
app.use(generalLimiter);
app.use(express.json());
app.use(sanitizeInput);

// ===== BASIC ROUTES =====
app.get('/', (req, res) => {
  res.json({ 
    message: 'Boxinator API Server is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API is healthy',
    database: 'Connected to PostgreSQL with Sequelize'
  });
});

// ===== AUTH ROUTES =====
app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    const { email, password, firstName, lastName, ...profileData } = value;
    
    // For now, just return success - implement actual user creation when models are ready
    const hashedPassword = await bcrypt.hash(password, 12);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        email,
        firstName,
        lastName
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details
      });
    }

    const { email, password } = value;
    
    // For now, just return a mock token - implement actual authentication when models are ready
    const token = jwt.sign(
      { email, userId: 1 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { email }
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===== SHIPMENT ROUTES =====
app.get('/api/shipments', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Shipments retrieved successfully',
    data: []
  });
});

app.post('/api/shipments', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Shipment created successfully',
    data: { id: 1, ...req.body }
  });
});

app.get('/api/shipments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Shipment retrieved successfully',
    data: { id, status: 'pending' }
  });
});

app.put('/api/shipments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Shipment updated successfully',
    data: { id, ...req.body }
  });
});

app.delete('/api/shipments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Shipment deleted successfully'
  });
});

// ===== USER ACCOUNT ROUTES =====
app.get('/api/account/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      email: req.user.email,
      firstName: 'John',
      lastName: 'Doe'
    }
  });
});

app.put('/api/account/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: req.body
  });
});

// ===== ADMIN ROUTES =====
app.get('/api/admin/users', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: []
  });
});

app.get('/api/admin/shipments', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'All shipments retrieved successfully',
    data: []
  });
});

// ===== SETTINGS ROUTES =====
app.get('/api/settings', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Settings retrieved successfully',
    data: {}
  });
});

app.put('/api/settings', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: req.body
  });
});

// ===== 404 HANDLER =====
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// ===== ERROR HANDLER =====
app.use(errorHandler);

// ===== SERVER STARTUP =====
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Synchronize models with database
    await sequelize.sync({ alter: true }); // For development; use { force: false } in production
    console.log('Database synchronized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

startServer();
