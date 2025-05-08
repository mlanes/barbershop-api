module.exports = (sequelize, DataTypes) => {
  const BarbershopOpenDay = sequelize.define('BarbershopOpenDay', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    barbershop_id: {
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
    opening_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    closing_time: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: 'barbershop_open_days',
    timestamps: false
  });

  BarbershopOpenDay.associate = (models) => {
    BarbershopOpenDay.belongsTo(models.Barbershop, { foreignKey: 'barbershop_id' });
  };

  return BarbershopOpenDay;
};