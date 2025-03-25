module.exports = (sequelize, DataTypes) => {
  const BarbershopOpenDays = sequelize.define('BarbershopOpenDays', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
    },
    opening_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    closing_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });

  return BarbershopOpenDays;
};
