'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO services (name, duration, price, barbershop_id, created_at, updated_at, is_active)
      VALUES (
        'Basic Haircut', 
        30, 
        25.00,
        (SELECT id FROM barbershop WHERE email = 'elitecuts@example.com'),
        NOW(),
        NOW(),
        true
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