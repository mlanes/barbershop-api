'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO appointments (customer_id, barber_id, service_id, appointment_time, status, created_at, updated_at)
      SELECT
        (SELECT id FROM users WHERE email = 'jane.doe@example.com'),
        b.id,
        s.id,
        '2024-03-05 14:00:00',
        'scheduled',
        NOW(),
        NOW()
      FROM barbers b, services s
      WHERE b.user_id = (SELECT id FROM users WHERE email = 'barber1@example.com')
        AND s.barbershop_id = (SELECT id FROM barbershop WHERE email = 'elitecuts@example.com')
      LIMIT 1
      ON CONFLICT DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM appointments WHERE 
        customer_id = (SELECT id FROM users WHERE email = 'jane.doe@example.com') AND 
        appointment_time = '2024-03-05 14:00:00';
    `);
  }
};