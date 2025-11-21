'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
		await queryInterface.addColumn('KineticCompartments', 'VolumeUnitId', {
			allowNull: true,
			type: Sequelize.INTEGER,
			references: {
				model: 'VolumeUnits',
				key: 'id'
			},
			onDelete: 'CASCADE'
    });

		await queryInterface.addConstraint('KineticCompartments', {
      fields: ['VolumeUnitId'],
      type: 'foreign key',
      name: 'KineticCompartments_VolumeUnitsId_fk',
      references: {
        table: 'VolumeUnits',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
		await queryInterface.removeConstraint('KineticCompartments', 'KineticCompartments_VolumeUnitsId_fk');
		await queryInterface.removeColumn('KineticCompartments', 'VolumeUnitId');
  }
};
