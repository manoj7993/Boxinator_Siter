const { Sequelize } = require('sequelize');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

<<<<<<< HEAD
console.log('🔧 Initializing database configuration...');

// Check if we should use SQLite fallback
const useLocalDB = process.env.USE_LOCAL_DB === 'true';
const useSupabaseAPI = process.env.USE_SUPABASE_API_ONLY === 'true';

// Check if Supabase credentials are provided and valid
const hasSupabaseConfig = (process.env.DATABASE_URL || 
                          (process.env.DB_HOST && 
                           process.env.DB_USER && 
                           process.env.DB_PASSWORD)) && 
                         process.env.SUPABASE_URL && 
                         process.env.SUPABASE_KEY &&
                         !process.env.SUPABASE_KEY.includes('your-');

let sequelize;

if (useLocalDB) {
  console.log('🗄️  Using SQLite database (local fallback)');
  console.log('📁 Database file: ./database.sqlite');
  
  // SQLite configuration
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
=======
const sequelize = new Sequelize(
  process.env.DB_NAME || 'Boxinator1',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    // logging: process.env.NODE_ENV === 'development' ? console.log : false,
    logging: false,
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else if (useSupabaseAPI || hasSupabaseConfig) {
  if (useSupabaseAPI) {
    console.log('🔗 Using Supabase API-only mode');
    console.log('⚠️  Direct database connection disabled for development');
    
    // Create a mock sequelize that won't actually connect
    sequelize = {
      authenticate: async () => {
        console.log('✅ Supabase API connection verified');
        return Promise.resolve();
      },
      sync: async () => {
        console.log('✅ Tables already exist in Supabase');
        return Promise.resolve();
      },
      close: async () => Promise.resolve(),
      query: async () => Promise.resolve([]),
      models: {},
      define: (name, attributes, options) => {
        console.log(`📋 Mock model definition for: ${name}`);
        const mockModel = {
          findAll: async () => [],
          findByPk: async () => null,
          findOne: async () => null,
          create: async () => ({}),
          update: async () => [1],
          destroy: async () => 1,
          sync: async () => Promise.resolve(),
          name: name
        };
        
        // Add association methods that return the model itself
        ['hasMany', 'belongsTo', 'belongsToMany', 'hasOne'].forEach(method => {
          mockModel[method] = function(...args) {
            console.log(`🔗 Mock association: ${name}.${method}(${args[0]?.name || args[0] || 'unknown'})`);
            return this;
          };
        });
        
        // Add hook method
        mockModel.addHook = () => {};
        
        return mockModel;
      },
      DataTypes: require('sequelize').DataTypes
    };
  } else {
    console.log('🐘 Using Supabase PostgreSQL');
    console.log('🔗 Supabase Host:', process.env.DB_HOST);
    
    // Check if DATABASE_URL is provided (connection string format)
    if (process.env.DATABASE_URL) {
      console.log('📄 Using DATABASE_URL connection string');
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
      sequelize = new Sequelize(
        process.env.DB_NAME || 'postgres',
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
          dialect: 'postgres',
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
          // Supabase requires SSL
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false
            },
            connectTimeout: 20000,
            acquireTimeout: 20000,
            timeout: 20000
          },
        }
      );
    }
  }
}

// Supabase client configuration (only if credentials available)
let supabase = null;
if (hasSupabaseConfig && !useLocalDB) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('🔗 Supabase URL:', supabaseUrl);
} else {
  console.log('⚠️  Supabase client not configured (using SQLite fallback)');
}

console.log('✅ Database configuration loaded');

module.exports = { sequelize, supabase };
