module.exports = (sequelize, DataTypes) => {
  const Barber = sequelize.define('Barber', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'barbers',
    timestamps: false
  });

  Barber.associate = (models) => {
    Barber.belongsTo(models.User, { foreignKey: 'user_id' });
    Barber.belongsTo(models.Branch, { foreignKey: 'branch_id' });
    Barber.hasMany(models.BarberAvailability, { foreignKey: 'barber_id' });
    Barber.hasMany(models.Appointment, { foreignKey: 'barber_id' });
    Barber.belongsToMany(models.Service, { 
      through: models.BarberService,
      foreignKey: 'barber_id',
      otherKey: 'service_id' 
    });
  };

  return Barber;
};