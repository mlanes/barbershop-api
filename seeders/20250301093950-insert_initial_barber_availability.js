'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [barbers] = await queryInterface.sequelize.query(
      'SELECT id FROM Barbers WHERE id = 1'
    );
    const barberId = barbers[0]?.id;

    if (!barberId) {
      throw new Error('Initial barber not found');
    }

    const availabilities = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      availabilities.push({
        barber_id: barberId,
        day_of_week: dayOfWeek,
        start_time: '09:00:00',
        end_time: '18:00:00',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert('BarberAvailabilities', availabilities);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('BarberAvailabilities', {
      barber_id: 1
    });
  }
};