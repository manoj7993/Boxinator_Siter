const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WeightTier = sequelize.define('WeightTier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  minWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  maxWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  baseCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'weight_tiers',
  timestamps: true,
  validate: {
    weightRange() {
      if (this.minWeight >= this.maxWeight) {
        throw new Error('minWeight must be less than maxWeight');
      }
    },
  },
});

module.exports = WeightTier;
