const { Sequelize } = require('sequelize');
const config = require('../config/config');

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
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Role = require('./role')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.Barbershop = require('./barbershop')(sequelize, Sequelize);
db.Barber = require('./barber')(sequelize, Sequelize);
db.Service = require('./service')(sequelize, Sequelize);
db.Appointment = require('./appointment')(sequelize, Sequelize);
db.BarbershopOpenDays = require('./barbershopOpenDays')(sequelize, Sequelize);
db.BarberAvailability = require('./barberAvailability')(sequelize, Sequelize);
db.BarberServices = require('./barberServices')(sequelize, Sequelize);

// Define associations
db.Role.hasMany(db.User);
db.User.belongsTo(db.Role);

db.Barbershop.hasMany(db.Barber);
db.Barber.belongsTo(db.Barbershop);

db.Barbershop.hasMany(db.Service);
db.Service.belongsTo(db.Barbershop);

db.User.hasOne(db.Barber);
db.Barber.belongsTo(db.User);

db.User.hasMany(db.Appointment, { foreignKey: 'customer_id' });
db.Appointment.belongsTo(db.User, { foreignKey: 'customer_id' });

db.Barber.hasMany(db.Appointment);
db.Appointment.belongsTo(db.Barber);

db.Service.hasMany(db.Appointment);
db.Appointment.belongsTo(db.Service);

db.Barbershop.hasMany(db.BarbershopOpenDays);
db.BarbershopOpenDays.belongsTo(db.Barbershop);

db.Barber.hasMany(db.BarberAvailability);
db.BarberAvailability.belongsTo(db.Barber);

db.Barber.hasMany(db.BarberServices);
db.BarberServices.belongsTo(db.Barber);
db.Service.hasMany(db.BarberServices);
db.BarberServices.belongsTo(db.Service);

module.exports = db;