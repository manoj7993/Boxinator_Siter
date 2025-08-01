const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BoxType = sequelize.define('BoxType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isIn: [['Small', 'Medium', 'Large', 'Extra Large']],
    },
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Box dimensions in format: LxWxH cm',
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
  tableName: 'box_types',
  timestamps: true,
});

module.exports = BoxType;
