const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CountryMultiplierLog = sequelize.define('CountryMultiplierLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  countryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries',
      key: 'id',
    },
  },
  previousMultiplier: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  newMultiplier: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Admin user who made the change',
  },
  reason: {
    type: DataTypes.TEXT,
    comment: 'Reason for the multiplier change',
  },
  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'When the new multiplier takes effect',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'country_multiplier_logs',
  timestamps: false,
});

module.exports = CountryMultiplierLog;
