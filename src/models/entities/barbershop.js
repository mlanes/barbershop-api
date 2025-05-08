module.exports = (sequelize, DataTypes) => {
  const Barbershop = sequelize.define('Barbershop', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
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
    tableName: 'barbershop',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Barbershop.associate = (models) => {
    Barbershop.hasMany(models.Barber, { foreignKey: 'barbershop_id' });
    Barbershop.hasMany(models.Service, { foreignKey: 'barbershop_id' });
    Barbershop.hasMany(models.BarbershopOpenDay, { foreignKey: 'barbershop_id' });
  };

  return Barbershop;
};