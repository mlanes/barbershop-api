require('dotenv').config();
const path = require('path');
const rootPath = path.normalize(__dirname + '/../..');

const config = {
  local: {
    dialect: process.env.DB_DIALECT,
    root: rootPath,
    db: process.env.DB_URL,
    dialectOptions: {
      ssl: false,
    },
    use_env_variable: 'DB_URL',
    logging: false,
  },
  development: {
    dialect: process.env.DB_DIALECT,
    root: rootPath,
    db: process.env.DB_URL,
    dialectOptions: {
      ssl: false,
    },
    use_env_variable: 'DB_URL',
    logging: false,
  },
  production: {
    dialect: process.env.DB_DIALECT,
    root: rootPath,
    db: process.env.DB_URL,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    use_env_variable: 'DB_URL',
    logging: false,
  }
};

const env = process.env.NODE_ENV || 'development';
console.log({ type: 'info', message: 'Current Database Config', data: config[env] });

module.exports = config;