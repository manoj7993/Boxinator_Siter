const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senderAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  senderCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senderPostalCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senderCountry: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  receiverCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverPostalCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverCountry: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  countryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries',
      key: 'id',
    },
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  dimensions: {
    type: DataTypes.JSON,
    comment: 'Length, width, height in cm',
  },
  description: {
    type: DataTypes.TEXT,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  currentStatusId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'shipment_statuses',
      key: 'id',
    },
  },
  estimatedDeliveryDate: {
    type: DataTypes.DATE,
  },
  actualDeliveryDate: {
    type: DataTypes.DATE,
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
  tableName: 'shipments',
  timestamps: true,
});

module.exports = Shipment;
