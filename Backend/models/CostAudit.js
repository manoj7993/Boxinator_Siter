const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CostAudit = sequelize.define('CostAudit', {
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
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  countryMultiplier: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  baseCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  finalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  calculationDetails: {
    type: DataTypes.JSON,
    comment: 'Detailed breakdown of cost calculation',
  },
  calculatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'cost_audits',
  timestamps: false,
});

module.exports = CostAudit;
