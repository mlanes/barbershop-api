'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      { name: 'owner' },
      { name: 'barber' },
      { name: 'customer' }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', {
      name: ['owner', 'barber', 'customer']
    }, {});
  }
};