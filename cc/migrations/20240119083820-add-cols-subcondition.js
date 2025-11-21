'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
		await queryInterface.addColumn('sub_condition_species', 'GeneId', {
			type: Sequelize.DataTypes.BIGINT,
			allowNull: true,
			references: {
				model: 'Genes',
				key: 'id'
			}
		});

		const newCols = {
			_createdBy: {
				type: Sequelize.DataTypes.BIGINT
			},
			_createdAt: {
				type: Sequelize.DataTypes.DATE
			},
			_updatedBy: {
				type: Sequelize.DataTypes.BIGINT
			},
			_updatedAt: {
				type: Sequelize.DataTypes.DATE
			},
			_deletedBy: {
				type: Sequelize.DataTypes.BIGINT
			},
			_deletedAt: {
				type: Sequelize.DataTypes.DATE
			},
			_deleted: {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			}
		}

		for (const newCol of Object.keys(newCols)) {
			await queryInterface.addColumn('sub_condition', newCol, newCols[newCol]);
		}
		
  },

  down: async (queryInterface, Sequelize) => {
    
		await queryInterface.removeColumn('sub_condition_species', 'GeneId');

		const newCols = ['_createdBy', '_createdAt', '_updatedBy', '_updatedAt', '_deletedBy', '_deletedAt', '_deleted'];

		for (let i=0; i<newCols.length;i++) {
			await queryInterface.removeColumn('sub_condition', newCols[i]);
		}

  }
};
