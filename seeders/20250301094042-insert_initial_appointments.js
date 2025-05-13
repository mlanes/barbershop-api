'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create appointment in downtown branch
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
      FROM barbers b
      JOIN branches br ON b.branch_id = br.id
      JOIN services s ON s.branch_id = br.id
      WHERE br.email = 'downtown@elitecuts.example.com'
        AND b.user_id = (SELECT id FROM users WHERE email = 'barber1@example.com')
        AND s.name = 'Basic Haircut'
      LIMIT 1
      ON CONFLICT DO NOTHING;
    `);

    // Create appointment in uptown branch
    await queryInterface.sequelize.query(`
      INSERT INTO appointments (customer_id, barber_id, service_id, appointment_time, status, created_at, updated_at)
      SELECT
        (SELECT id FROM users WHERE email = 'jane.doe@example.com'),
        b.id,
        s.id,
        '2024-03-06 15:00:00',
        'scheduled',
        NOW(),
        NOW()
      FROM barbers b
      JOIN branches br ON b.branch_id = br.id
      JOIN services s ON s.branch_id = br.id
      WHERE br.email = 'uptown@elitecuts.example.com'
        AND b.user_id = (SELECT id FROM users WHERE email = 'barber1@example.com')
        AND s.name = 'Premium Haircut'
      LIMIT 1
      ON CONFLICT DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM appointments 
      WHERE appointment_time IN ('2024-03-05 14:00:00', '2024-03-06 15:00:00')
        AND customer_id = (SELECT id FROM users WHERE email = 'jane.doe@example.com');
    `);
  }
};