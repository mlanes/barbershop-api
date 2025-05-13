'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert services for downtown branch
    await queryInterface.sequelize.query(`
      INSERT INTO services (name, duration, price, branch_id, created_at, updated_at, is_active)
      VALUES 
        ('Basic Haircut', 30, 25.00,
          (SELECT id FROM branches WHERE email = 'downtown@elitecuts.example.com'),
          NOW(), NOW(), true),
        ('Premium Haircut', 45, 35.00,
          (SELECT id FROM branches WHERE email = 'downtown@elitecuts.example.com'),
          NOW(), NOW(), true),
        ('Beard Trim', 20, 15.00,
          (SELECT id FROM branches WHERE email = 'downtown@elitecuts.example.com'),
          NOW(), NOW(), true)
      ON CONFLICT DO NOTHING;
    `);

    // Insert services for uptown branch (with different prices)
    await queryInterface.sequelize.query(`
      INSERT INTO services (name, duration, price, branch_id, created_at, updated_at, is_active)
      VALUES 
        ('Basic Haircut', 30, 30.00,
          (SELECT id FROM branches WHERE email = 'uptown@elitecuts.example.com'),
          NOW(), NOW(), true),
        ('Premium Haircut', 45, 40.00,
          (SELECT id FROM branches WHERE email = 'uptown@elitecuts.example.com'),
          NOW(), NOW(), true),
        ('Beard Trim', 20, 20.00,
          (SELECT id FROM branches WHERE email = 'uptown@elitecuts.example.com'),
          NOW(), NOW(), true)
      ON CONFLICT DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM services 
      WHERE branch_id IN (
        SELECT id FROM branches 
        WHERE email IN ('downtown@elitecuts.example.com', 'uptown@elitecuts.example.com')
      );
    `);
  }
};