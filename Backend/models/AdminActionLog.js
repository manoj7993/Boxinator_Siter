const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminActionLog = sequelize.define('AdminActionLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  adminUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type of action performed',
  },
  targetType: {
    type: DataTypes.STRING,
    comment: 'Type of entity affected (user, shipment, etc.)',
  },
  targetId: {
    type: DataTypes.INTEGER,
    comment: 'ID of the affected entity',
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'Detailed description of the action',
  },
  ipAddress: {
    type: DataTypes.STRING,
  },
  userAgent: {
    type: DataTypes.TEXT,
  },
  previousData: {
    type: DataTypes.JSON,
    comment: 'Previous state before the action',
  },
  newData: {
    type: DataTypes.JSON,
    comment: 'New state after the action',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'admin_action_logs',
  timestamps: false,
});

module.exports = AdminActionLog;
