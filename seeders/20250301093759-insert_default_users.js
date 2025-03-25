'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO users (full_name, email, password_hash, role_id, created_at)
      VALUES
        ('Jane Doe', 'jane.doe@example.com', 'hashed_password_here', (SELECT id FROM roles WHERE name = 'customer'), NOW()),
        ('Barber One', 'barber1@example.com', 'hashed_password_here', (SELECT id FROM roles WHERE name = 'barber'), NOW())
      ON CONFLICT (email) DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM users WHERE email IN ('jane.doe@example.com', 'barber1@example.com');
    `);
  }
};