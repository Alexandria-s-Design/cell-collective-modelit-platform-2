'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

		const defaultAttrs = {
			creationdate: {
				type: Sequelize.DATE
			},
			creationuser: {
				type: Sequelize.BIGINT,
				allowNull: true
			},
			updatedate: {
				type: Sequelize.DATE,
				allowNull: true
			},
			updateuser: {
				type: Sequelize.BIGINT,
				allowNull: true
			},
			_deletedBy: {
        type: Sequelize.INTEGER
      },
      _deletedAt: {
        type: Sequelize.DATE
      },
			_deleted: {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			}
		}

		await queryInterface.createTable('PageModel', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
			reactionId: {
        allowNull: true,
        type: Sequelize.BIGINT
      },
			geneId: {
        allowNull: true,
        type: Sequelize.BIGINT
      },
			speciesId: {
        allowNull: true,
        type: Sequelize.BIGINT
      },
			metaboliteId: {
        allowNull: true,
        type: Sequelize.BIGINT
      },
			compartmentId: {
        allowNull: true,
        type: Sequelize.BIGINT
      },
			ModelVersionId: {
				type: Sequelize.BIGINT,
				allowNull: true
			},
			...defaultAttrs
    });

		await queryInterface.sequelize.query(`
			CREATE INDEX PageModel_reactionId_btree
			ON public."PageModel"
			USING btree("id","reactionId");

			CREATE INDEX PageModel_geneId_btree
			ON public."PageModel"
			USING btree("id","geneId");

			CREATE INDEX PageModel_speciesId_btree
			ON public."PageModel"
			USING btree("id","speciesId");

			CREATE INDEX PageModel_metaboliteId_btree
			ON public."PageModel"
			USING btree("id","metaboliteId");

			CREATE INDEX PageModel_compartmentId_btree
			ON public."PageModel"
			USING btree("id","compartmentId");

			CREATE INDEX PageModel_ModelVersionId_btree
			ON public."PageModel"
			USING btree("ModelVersionId");
		`);

		await queryInterface.createTable('SectionModel', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
			pageModelId: {
        allowNull: true,
        type: Sequelize.BIGINT,
				references: {
					model: 'PageModel',
					key: 'id'
				},
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE'
      },
			title: {
        allowNull: true,
        type: Sequelize.STRING(200)
      },
			type: {
        allowNull: true,
        type: Sequelize.STRING(80)
      },
			position: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
			...defaultAttrs
    });

		await queryInterface.createTable('ContentModel', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
			sectionModelId: {
        allowNull: true,
        type: Sequelize.BIGINT,
				references: {
					model: 'SectionModel',
					key: 'id'
				},
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE'
      },
			flagged: {
        allowNull: true,
        type: Sequelize.BOOLEAN
      },
			text: {
        allowNull: true,
        type: Sequelize.TEXT
      },
			position: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
			...defaultAttrs
    });
  },

  down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('ContentModel');
		await queryInterface.dropTable('SectionModel');
		await queryInterface.dropTable('PageModel');		
  }
};
