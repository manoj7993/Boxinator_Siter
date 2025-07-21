const { sequelize } = require('../config/database');

// Import all models here
// const User = require('./User');
// const UserProfile = require('./UserProfile');
// const Shipment = require('./Shipment');
// const Country = require('./Country');
// const WeightTier = require('./WeightTier');
// const ShipmentStatus = require('./ShipmentStatus');
// const ShipmentStatusHistory = require('./ShipmentStatusHistory');
// const EmailVerificationToken = require('./EmailVerificationToken');
// const PasswordResetToken = require('./PasswordResetToken');
// const RefreshToken = require('./RefreshToken');
// const AdminActionLog = require('./AdminActionLog');
// const CostAudit = require('./CostAudit');
// const CountryMultiplierLog = require('./CountryMultiplierLog');

// Define associations here
// User.hasOne(UserProfile, { foreignKey: 'userId' });
// UserProfile.belongsTo(User, { foreignKey: 'userId' });

// Export all models
module.exports = {
  sequelize,
  // User,
  // UserProfile,
  // Shipment,
  // Country,
  // WeightTier,
  // ShipmentStatus,
  // ShipmentStatusHistory,
  // EmailVerificationToken,
  // PasswordResetToken,
  // RefreshToken,
  // AdminActionLog,
  // CostAudit,
  // CountryMultiplierLog,
};
