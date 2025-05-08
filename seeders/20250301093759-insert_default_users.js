'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO users (full_name, email, cognito_sub, dob, phone, role_id, created_at)
      VALUES
        ('Jane Doe', 'jane.doe@example.com', 'mock-cognito-sub-jane', '1990-01-15', '+1234567890', (SELECT id FROM roles WHERE name = 'customer'), NOW()),
        ('Barber One', 'barber1@example.com', 'mock-cognito-sub-barber1', '1985-05-20', '+1987654321', (SELECT id FROM roles WHERE name = 'barber'), NOW())
      ON CONFLICT (email) DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM users WHERE email IN ('jane.doe@example.com', 'barber1@example.com');
    `);
  }
};