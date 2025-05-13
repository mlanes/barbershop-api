'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert schedule for downtown branch
    await queryInterface.sequelize.query(`
      INSERT INTO barbershop_open_days (branch_id, day_of_week, opening_time, closing_time)
      SELECT 
        (SELECT id FROM branches WHERE email = 'downtown@elitecuts.example.com'),
        unnest(ARRAY[0, 1, 2, 3, 4, 5, 6]),
        unnest(ARRAY['10:00:00'::TIME, '08:00:00'::TIME, '08:00:00'::TIME, '08:00:00'::TIME, '08:00:00'::TIME, '08:00:00'::TIME, '09:00:00'::TIME]),
        unnest(ARRAY['16:00:00'::TIME, '20:00:00'::TIME, '20:00:00'::TIME, '20:00:00'::TIME, '20:00:00'::TIME, '20:00:00'::TIME, '18:00:00'::TIME])
      WHERE EXISTS (SELECT id FROM branches WHERE email = 'downtown@elitecuts.example.com')
      ON CONFLICT DO NOTHING;
    `);

    // Insert schedule for uptown branch (with slightly different hours)
    await queryInterface.sequelize.query(`
      INSERT INTO barbershop_open_days (branch_id, day_of_week, opening_time, closing_time)
      SELECT 
        (SELECT id FROM branches WHERE email = 'uptown@elitecuts.example.com'),
        unnest(ARRAY[0, 1, 2, 3, 4, 5, 6]),
        unnest(ARRAY['11:00:00'::TIME, '09:00:00'::TIME, '09:00:00'::TIME, '09:00:00'::TIME, '09:00:00'::TIME, '09:00:00'::TIME, '10:00:00'::TIME]),
        unnest(ARRAY['17:00:00'::TIME, '21:00:00'::TIME, '21:00:00'::TIME, '21:00:00'::TIME, '21:00:00'::TIME, '21:00:00'::TIME, '19:00:00'::TIME])
      WHERE EXISTS (SELECT id FROM branches WHERE email = 'uptown@elitecuts.example.com')
      ON CONFLICT DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM barbershop_open_days 
      WHERE branch_id IN (
        SELECT id FROM branches 
        WHERE email IN ('downtown@elitecuts.example.com', 'uptown@elitecuts.example.com')
      );
    `);
  }
};