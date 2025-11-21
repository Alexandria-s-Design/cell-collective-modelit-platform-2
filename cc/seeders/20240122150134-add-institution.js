'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Institutions', [
      {
        id: 4808,
        _createdAt: new Date(),
        _updatedAt: new Date(),
        _deleted: false,
        name: 'Universidad de los Andes',
        category: 'MASTERS',
        city: 'Bogotá',
        country: 'CO',
        state: 'CO'
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    //return queryInterface.bulkDelete('Institutions', null, {});
  }
};