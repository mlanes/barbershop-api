'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO barbershop_open_days (barbershop_id, day_of_week, opening_time, closing_time)
      VALUES 
        ((SELECT id FROM barbershops WHERE email = 'elitecuts@example.com'), 0, '10:00', '16:00'),
        ((SELECT id FROM barbershops WHERE email = 'elitecuts@example.com'), 1, '08:00', '20:00'),
        ((SELECT id FROM barbershops WHERE email = 'elitecuts@example.com'), 2, '08:00', '20:00'),
        ((SELECT id FROM barbershops WHERE email = 'elitecuts@example.com'), 3, '08:00', '20:00'),
        ((SELECT id FROM barbershops WHERE email = 'elitecuts@example.com'), 4, '08:00', '20:00'),
        ((SELECT id FROM barbershops WHERE email = 'elitecuts@example.com'), 5, '08:00', '20:00'),
        ((SELECT id FROM barbershops WHERE email = 'elitecuts@example.com'), 6, '09:00', '18:00')
      ON CONFLICT DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM barbershop_open_days WHERE barbershop_id = (SELECT id FROM barbershops WHERE email = 'elitecuts@example.com');
    `);
  }
};