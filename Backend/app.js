const express          = require('express');
const helmet           = require('helmet');
const cors             = require('cors');
const { generalLimiter } = require('./middleware/rateLimiter');
const sanitizeInput    = require('./middleware/sanitizeInput');
const errorHandler     = require('./middleware/errorHandler');

// Import routes
const authRoutes       = require('./routes/authRoutes');
const shipmentRoutes   = require('./routes/shipmentRoutes');
const userRoutes       = require('./routes/userRoutes');
const adminRoutes      = require('./routes/adminRoutes');
const settingsRoutes   = require('./routes/settingsRoutes');

require('dotenv').config();

const app = express();

// Security middleware (order matters!)
app.use(helmet());
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true 
}));
app.use(generalLimiter);          // Global rate limit
app.use(express.json());
app.use(sanitizeInput);           // Sanitize all inputs

// Basic health check routes
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

// Mount API routes
app.use('/api/auth',     authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/account',  userRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handler - ALWAYS last
app.use(errorHandler);

module.exports = app;
