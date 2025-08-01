const { sequelize, supabase } = require('../config/database');

// Import all models here
const User = require('./User');
const UserProfile = require('./UserProfile');
const Shipment = require('./Shipment');
const Country = require('./Country');
const WeightTier = require('./WeightTier');
const BoxType = require('./BoxType');
const ShipmentStatus = require('./ShipmentStatus');
const ShipmentStatusHistory = require('./ShipmentStatusHistory');
const EmailVerificationToken = require('./EmailVerificationToken');
const PasswordResetToken = require('./PasswordResetToken');
const RefreshToken = require('./RefreshToken');
const AdminActionLog = require('./AdminActionLog');
const CostAudit = require('./CostAudit');
const CountryMultiplierLog = require('./CountryMultiplierLog');

// Define associations here

// User - UserProfile associations
User.hasOne(UserProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

// User - Shipment associations
User.hasMany(Shipment, { foreignKey: 'userId', as: 'shipments' });
Shipment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Country - Shipment associations
Country.hasMany(Shipment, { foreignKey: 'countryId', as: 'shipments' });
Shipment.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

// BoxType - Shipment associations
BoxType.hasMany(Shipment, { foreignKey: 'boxTypeId', as: 'shipments' });
Shipment.belongsTo(BoxType, { foreignKey: 'boxTypeId', as: 'boxType' });

// ShipmentStatus - Shipment associations
ShipmentStatus.hasMany(Shipment, { foreignKey: 'currentStatusId', as: 'shipments' });
Shipment.belongsTo(ShipmentStatus, { foreignKey: 'currentStatusId', as: 'currentStatus' });

// Shipment - ShipmentStatusHistory associations
Shipment.hasMany(ShipmentStatusHistory, { foreignKey: 'shipmentId', as: 'statusHistory' });
ShipmentStatusHistory.belongsTo(Shipment, { foreignKey: 'shipmentId', as: 'shipment' });

// ShipmentStatus - ShipmentStatusHistory associations
ShipmentStatus.hasMany(ShipmentStatusHistory, { foreignKey: 'statusId', as: 'statusHistory' });
ShipmentStatusHistory.belongsTo(ShipmentStatus, { foreignKey: 'statusId', as: 'status' });

// User - Token associations
User.hasMany(EmailVerificationToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
EmailVerificationToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PasswordResetToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// Admin - AdminActionLog associations
User.hasMany(AdminActionLog, { foreignKey: 'adminUserId', as: 'adminActions' });
AdminActionLog.belongsTo(User, { foreignKey: 'adminUserId', as: 'admin' });

// User - ShipmentStatusHistory associations (for updatedBy)
User.hasMany(ShipmentStatusHistory, { foreignKey: 'updatedBy', as: 'statusUpdates' });
ShipmentStatusHistory.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });

// Shipment - CostAudit associations
Shipment.hasMany(CostAudit, { foreignKey: 'shipmentId', as: 'costAudits' });
CostAudit.belongsTo(Shipment, { foreignKey: 'shipmentId', as: 'shipment' });

// User - CostAudit associations
User.hasMany(CostAudit, { foreignKey: 'userId', as: 'costAudits' });
CostAudit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Country - CountryMultiplierLog associations
Country.hasMany(CountryMultiplierLog, { foreignKey: 'countryId', as: 'multiplierLogs' });
CountryMultiplierLog.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

// User - CountryMultiplierLog associations (for changedBy)
User.hasMany(CountryMultiplierLog, { foreignKey: 'changedBy', as: 'multiplierChanges' });
CountryMultiplierLog.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });

// Export all models
module.exports = {
  sequelize,
  supabase,
  User,
  UserProfile,
  Shipment,
  Country,
  WeightTier,
  BoxType,
  ShipmentStatus,
  ShipmentStatusHistory,
  EmailVerificationToken,
  PasswordResetToken,
  RefreshToken,
  AdminActionLog,
  CostAudit,
  CountryMultiplierLog,
};
