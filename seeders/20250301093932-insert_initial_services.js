'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO services (name, duration, price, created_at, updated_at, barbershop_id)
      VALUES (
        'Basic Haircut', 
        '30 minutes', 
        25.00,
        now(),
        now(),
        (SELECT id FROM barbershops WHERE email = 'elitecuts@example.com')
      )
      ON CONFLICT DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM services WHERE name = 'Basic Haircut' AND barbershop_id = (SELECT id FROM barbershop WHERE email = 'elitecuts@example.com');
    `);
  }
};