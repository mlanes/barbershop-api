'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO barbershop (name, address, email, phone, created_at, updated_at, is_active)
      VALUES (
        'Elite Cuts', 
        '123 Barber St, NY', 
        'elitecuts@example.com', 
        '123-456-7890',
        NOW(),
        NOW(),
        true
      )
      ON CONFLICT (email) DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM barbershop WHERE email = 'elitecuts@example.com';
    `);
  }
};