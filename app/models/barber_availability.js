module.exports = (sequelize, DataTypes) => {
  const BarberAvailability = sequelize.define('BarberAvailability', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    barber_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6
      }
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: 'barber_availability',
    timestamps: false
  });

  BarberAvailability.associate = (models) => {
    BarberAvailability.belongsTo(models.Barber, { foreignKey: 'barber_id' });
  };

  return BarberAvailability;
};