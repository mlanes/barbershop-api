module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER, // Store as minutes for simplicity
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    barbershop_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Service.associate = (models) => {
    Service.belongsTo(models.Barbershop, { foreignKey: 'barbershop_id' });
    Service.belongsToMany(models.Barber, { 
      through: models.BarberService,
      foreignKey: 'service_id',
      otherKey: 'barber_id' 
    });
    Service.hasMany(models.Appointment, { foreignKey: 'service_id' });
  };

  return Service;
};