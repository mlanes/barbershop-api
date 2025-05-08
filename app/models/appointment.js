module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    barber_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    appointment_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'scheduled',
      validate: {
        isIn: [['scheduled', 'completed', 'canceled']]
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'appointments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_appointments_time',
        fields: ['appointment_time']
      }
    ]
  });

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, { foreignKey: 'customer_id', as: 'Customer' });
    Appointment.belongsTo(models.Barber, { foreignKey: 'barber_id' });
    Appointment.belongsTo(models.Service, { foreignKey: 'service_id' });
    Appointment.hasOne(models.Payment, { foreignKey: 'appointment_id' });
  };

  return Appointment;
};