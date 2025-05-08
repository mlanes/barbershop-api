const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');
const env = require('../config/env');
const basename = path.basename(__filename);

const environment = env.NODE_ENV || 'development';
const dbConfig = config[environment];

const sequelize = new Sequelize(dbConfig.db, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  ssl: dbConfig.dialectOptions.ssl,
  define: { 
    underscored: true,
    paranoid: true, // Enable soft deletes
    timestamps: true, // Enable timestamps
  },
  pool: {
    max: 32,
    min: 1,
    idle: 30000,
    acquire: 300000,
  },
});

const db = {};

// 1. Read every .js file in models/entities/ except this index.js
const entitiesPath = path.join(__dirname, 'entities');
fs
  .readdirSync(entitiesPath)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js'
  ))
  .forEach(file => {
    // logger.debug(`Loading model: ${file}`);
    const defineModel = require(path.join(entitiesPath, file));
    const model = defineModel(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 2. Run all `associate()` methods to hook up relationships
Object.values(db)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => {
    // logger.debug(`Setting up associations for model: ${model.name}`);
    model.associate(db);
  });

// 3. Export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;