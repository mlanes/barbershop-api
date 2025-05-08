const path = require('path');
const env = require('./env');
const logger = require('../utils/logger');
const rootPath = path.normalize(__dirname + '/../..');

const config = {
  local: {
    dialect: env.DB_DIALECT,
    root: rootPath,
    db: env.DB_URL,
    dialectOptions: {
      ssl: false,
    },
    use_env_variable: 'DB_URL',
    // logging: msg => logger.debug(msg),
    sync: { alter: true },
  },
  development: {
    dialect: env.DB_DIALECT,
    root: rootPath,
    db: env.DB_URL,
    dialectOptions: {
      ssl: false,
    },
    use_env_variable: 'DB_URL',
    // logging: msg => logger.debug(msg),
    sync: { alter: true },
  },
  production: {
    dialect: env.DB_DIALECT,
    root: rootPath,
    db: env.DB_URL,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    use_env_variable: 'DB_URL',
    logging: false,
    sync: false, // Don't auto-sync in production
  }
};

const environment = env.NODE_ENV;
console.log({ type: 'info', message: 'Current Database Config', data: config[environment] });

module.exports = config;