module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    barbershop_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    tableName: 'branches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Branch.associate = (models) => {
    Branch.belongsTo(models.Barbershop, { foreignKey: 'barbershop_id' });
    Branch.hasMany(models.Barber, { foreignKey: 'branch_id' });
    Branch.hasMany(models.BarbershopOpenDay, { foreignKey: 'branch_id' });
    Branch.hasMany(models.Service, { foreignKey: 'branch_id' });
  };

  return Branch;
};