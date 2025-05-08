const path = require('path');
const env = require('./env');
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
    logging: false,
  },
  development: {
    dialect: env.DB_DIALECT,
    root: rootPath,
    db: env.DB_URL,
    dialectOptions: {
      ssl: false,
    },
    use_env_variable: 'DB_URL',
    logging: false,
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
  }
};

const environment = env.NODE_ENV;
console.log({ type: 'info', message: 'Current Database Config', data: config[environment] });

module.exports = config;