'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO branches (barbershop_id, name, address, email, phone, created_at, updated_at, is_active)
      SELECT 
        (SELECT id FROM barbershop WHERE email = 'elitecuts@example.com'),
        'Elite Cuts - Downtown',
        '123 Barber St, Downtown NY',
        'downtown@elitecuts.example.com',
        '123-456-7890',
        NOW(),
        NOW(),
        true
      WHERE EXISTS (SELECT id FROM barbershop WHERE email = 'elitecuts@example.com')
      ON CONFLICT (email) DO NOTHING;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO branches (barbershop_id, name, address, email, phone, created_at, updated_at, is_active)
      SELECT 
        (SELECT id FROM barbershop WHERE email = 'elitecuts@example.com'),
        'Elite Cuts - Uptown',
        '456 Barber Ave, Uptown NY',
        'uptown@elitecuts.example.com',
        '123-456-7891',
        NOW(),
        NOW(),
        true
      WHERE EXISTS (SELECT id FROM barbershop WHERE email = 'elitecuts@example.com')
      ON CONFLICT (email) DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM branches 
      WHERE email IN ('downtown@elitecuts.example.com', 'uptown@elitecuts.example.com');
    `);
  }
};