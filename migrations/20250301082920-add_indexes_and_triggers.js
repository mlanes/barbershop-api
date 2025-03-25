'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add index for performance
    await queryInterface.addIndex('appointments', ['appointment_time'], {
      name: 'idx_appointments_time'
    });

    // Create function to prevent double booking
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION prevent_double_booking()
      RETURNS TRIGGER AS $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM appointments
          WHERE barber_id = NEW.barber_id
          AND appointment_time = NEW.appointment_time
        ) THEN
          RAISE EXCEPTION 'This barber is already booked for the selected time slot';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger for double booking prevention
    await queryInterface.sequelize.query(`
      CREATE TRIGGER check_double_booking
      BEFORE INSERT ON appointments
      FOR EACH ROW EXECUTE FUNCTION prevent_double_booking();
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('appointments', 'idx_appointments_time');

    // Drop trigger and function
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS check_double_booking ON appointments;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS prevent_double_booking;');
  }
};