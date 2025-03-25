module.exports = (sequelize, DataTypes) => {
  const BarberServices = sequelize.define('BarberServices', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  }, {
    timestamps: false,
  });

  return BarberServices;
};