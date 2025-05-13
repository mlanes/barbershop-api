'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO barbers (user_id, branch_id, is_active)
      SELECT 
        (SELECT id FROM users WHERE email = 'barber1@example.com'), 
        (SELECT id FROM branches WHERE email = 'downtown@elitecuts.example.com'),
        true
      WHERE EXISTS (SELECT id FROM branches WHERE email = 'downtown@elitecuts.example.com')
        AND EXISTS (SELECT id FROM users WHERE email = 'barber1@example.com')
      ON CONFLICT DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM barbers 
      WHERE user_id = (SELECT id FROM users WHERE email = 'barber1@example.com') 
      AND branch_id = (SELECT id FROM branches WHERE email = 'downtown@elitecuts.example.com');
    `);
  }
};