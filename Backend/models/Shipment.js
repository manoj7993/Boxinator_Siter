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
    allowNull: true, // Allow null for guest users
    references: {
      model: 'users',
      key: 'id',
    },
  },
  guestEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
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
  senderEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  senderPhone: {
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
  receiverEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  receiverPhone: {
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
  boxTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'box_types',
      key: 'id',
    },
  },
  countryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries',
      key: 'id',
    },
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
