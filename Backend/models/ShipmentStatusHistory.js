const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ShipmentStatusHistory = sequelize.define('ShipmentStatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  shipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shipments',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  statusId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shipment_statuses',
      key: 'id',
    },
  },
  location: {
    type: DataTypes.STRING,
    comment: 'Current location of the shipment',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Admin user who updated the status',
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'shipment_status_history',
  timestamps: false,
});

module.exports = ShipmentStatusHistory;
