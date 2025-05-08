const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config');
const basename = path.basename(__filename);

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

const sequelize = new Sequelize(dbConfig.db, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  ssl: dbConfig.dialectOptions.ssl,
  define: { underscored: true },
  pool: {
    max: 32,
    idle: 30000,
    acquire: 300000,
  },
});

const db = {};

// 1. Read every .js file in models/ except this index.js
fs
  .readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js'
  ))
  .forEach(file => {
    const defineModel = require(path.join(__dirname, file));
    const model = defineModel(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 2. Run all `associate()` methods to hook up relationships
Object.values(db)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(db));

// 3. Export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
