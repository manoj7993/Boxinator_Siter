const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

console.log('🔧 Initializing database configuration...');

// Check if we should use SQLite fallback for local development
const useLocalDB = process.env.USE_LOCAL_DB === 'true';

let sequelize;

if (useLocalDB) {
  console.log('🗄️  Using SQLite database (local fallback)');
  console.log('📁 Database file: ./database.sqlite');
  
  // SQLite configuration for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  console.log('� Using Railway PostgreSQL database');
  
  // Check if DATABASE_URL is provided (Railway's preferred method)
  if (process.env.DATABASE_URL) {
    console.log('📄 Using DATABASE_URL connection string from Railway');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      }
    });
  } else {
    // Individual parameter configuration for PostgreSQL connection
    console.log('🔗 Using individual database parameters');
    sequelize = new Sequelize(
      process.env.DB_NAME || process.env.PGDATABASE || 'railway',
      process.env.DB_USER || process.env.PGUSER || 'postgres',
      process.env.DB_PASSWORD || process.env.PGPASSWORD,
      {
        host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
        port: process.env.DB_PORT || process.env.PGPORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        // Railway requires SSL in production
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false,
          connectTimeout: 20000,
          acquireTimeout: 20000,
          timeout: 20000
        },
      }
    );
  }
}

console.log('✅ Database configuration loaded');

module.exports = { sequelize };
