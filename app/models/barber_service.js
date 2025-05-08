module.exports = (sequelize, DataTypes) => {
  const BarberService = sequelize.define('BarberService', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    barber_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'barber_services',
    timestamps: false
  });

  BarberService.associate = (models) => {
    // Associations defined in Barber and Service models
  };

  return BarberService;
};