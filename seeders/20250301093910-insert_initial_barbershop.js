'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO barbershops (name, address, email, phone, created_at, updated_at)
      VALUES (
        'Elite Cuts', 
        '123 Barber St, NY', 
        'elitecuts@example.com', 
        '123-456-7890', 
        now(),
        now()
      )
      ON CONFLICT (email) DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM barbershops WHERE email = 'elitecuts@example.com';
    `);
  }
};