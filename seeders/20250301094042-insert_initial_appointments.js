'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO appointments (customer_id, barber_id, service_id, appointment_time, created_at, updated_at)
      VALUES (
        (SELECT id FROM users WHERE email = 'jane.doe@example.com'),
        (SELECT id FROM barbers WHERE user_id = (SELECT id FROM users WHERE email = 'barber1@example.com')),
        (SELECT id FROM services WHERE barbershop_id = (SELECT id FROM barbershops WHERE email = 'elitecuts@example.com') LIMIT 1),
        '2024-03-05 14:00:00',
        now(),
        now()
      )
      ON CONFLICT DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM appointments WHERE 
        customer_id = (SELECT id FROM users WHERE email = 'jane.doe@example.com') AND 
        barber_id = (SELECT id FROM barbers WHERE user_id = (SELECT id FROM users WHERE email = 'barber1@example.com')) AND 
        service_id = (SELECT id FROM services WHERE barbershop_id = (SELECT id FROM barbershops WHERE email = 'elitecuts@example.com') LIMIT 1) AND 
        appointment_time = '2024-03-05 14:00:00';
    `);
  }
};