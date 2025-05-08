module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        isIn: [['owner', 'barber', 'customer']]
      }
    }
  }, {
    tableName: 'roles',
    timestamps: false
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'role_id' });
  };

  return Role;
};