import Sequelize from "sequelize";
import { createAttributes } from "../db/mixins/attributes"

const queries						= {
	up: [
		
	],
	down: [
		
	]
}

const defaultAttributes = createAttributes();

const tablesExtensions  = {
  "model": {
    hasSeq: true
  },
  "model_version": {
		createSeq: true,
		hasSeq: true
  },
  "species": {
    hasSeq: true
  },
  "regulator": {
    hasSeq: true
	},
	"condition": {
		createSeq: true,
		hasSeq: true
	},
	"condition_species": {
		createSeq: false,
		hasSeq: false
	}
};

const addColumnConfig   = {
  "model": [
    {
      column: "modelType",
			constraints: Sequelize.STRING,
			then: (queryInterface, DataTypes) => {
				return queryInterface.sequelize.query(`
					UPDATE model
					SET "modelType" = 'boolean'
					WHERE "modelType" IS NULL
				`);
			}
		},
		// {
		// 	column: "defaultVersion",
		// 	constraints: {
		// 		type: Sequelize.BIGINT,
		// 		references: {
		// 			model: "ModelVersion",
		// 			key: "id"
		// 		}
		// 	}
		// }
    // {
    //   column: "CourseId",
    //   constraints: {
    //     type: Sequelize.BIGINT,
    //     references: {
    //       model: "Course",
    //       key: "id"
    //     }
    //   }
    // }
  ],
  // "model_version": [
  //   {
  //     column: "BaseModelId",
  //     constraints: {
  //       type: Sequelize.BIGINT,
  //       references: {
  //         model: "model",
  //         key: "id"
  //       }
  //     }
  //   }
  // ],
  "species": [
    {
      column: "speciesId",
      constraints: Sequelize.STRING
    }
	],
  "regulator": [
    {
      column: "ReactionGeneId",
      constraints: {
        type: Sequelize.INTEGER,
  //       references: {
  //         model: "ReactionGenes",
  //         key: "id"
  //       },
        allowNull: true
      }
		}
	],
	"condition_species": [
		{
			column: "GeneId",
			constraints: {
				type: Sequelize.INTEGER,
				references: {
					model: "Genes",
					key: "id"
				},
				allowNull: true
			}
		}
	]
}

const tableConfiguration = {
	"ReactionGenes": {
		attributes: {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true
			}
		},
		createConfig: {
			indexes: [
				{
					unique: true,
					fields: ["ReactionId", "GeneId"]
				}
			]
		}
	},
  "CompartmentSpecies": {
		attributes: {
			CompartmentId: {
				type: Sequelize.UUID,
				primaryKey: true,	
			},
			SpeciesId: {
				type: Sequelize.UUID,
				primaryKey: true,
			}
		}
  }
}

export default {
  up: async (queryInterface, DataTypes) => {
		Object.keys(tableConfiguration)
      .forEach(async tableName => {
        await queryInterface.createTable(tableName,
          { 
            ...defaultAttributes,
            ...(tableConfiguration[tableName].attributes || { })
					},
					tableConfiguration[tableName].createConfig
        )
			});
			
		queries.up.forEach(async query => await queryInterface.sequelize.query(query))

    // Extend Default Attributes to Tables...
    Object.keys(tablesExtensions)
      .forEach(async tableName => {
				const tableConfiguration = tablesExtensions[tableName];

        Object.keys(defaultAttributes)
          .forEach(async attribute =>
            await queryInterface.addColumn(
              tableName,
              attribute,
              defaultAttributes[attribute]
            )
					);
					
				if ( tableConfiguration.createSeq ) {
					await queryInterface.sequelize.query(`
						CREATE SEQUENCE IF NOT EXISTS ${tableName}_id_seq OWNED BY ${tableName}.id;
						SELECT setval('${tableName}_id_seq', (SELECT MAX(id) + 1 FROM ${tableName}));
					`);
				}

        if ( tableConfiguration.hasSeq ) {
          await queryInterface.sequelize.query(`
            ALTER TABLE ${tableName}
            ALTER COLUMN id SET DEFAULT nextval('${tableName}_id_seq'::regclass);
          `);
        }
      });

    // Change Column
    const changeColumnConfig = {
      "model": [
        { "attribute": "name", 					 			  constraints: { type: DataTypes.STRING,  allowNull: true } },
        { "attribute": "published", 		 			  constraints: { type: DataTypes.BOOLEAN, allowNull: true } },
        { "attribute": "biologicupdatedate", 	  constraints: { type: DataTypes.DATE, 	 	allowNull: true } },
        { "attribute": "components", 		 			  constraints: { type: DataTypes.INTEGER, allowNull: true } },
        { "attribute": "interactions", 	 			  constraints: { type: DataTypes.INTEGER, allowNull: true } },
        { "attribute": "creationdate", 	 			  constraints: { type: DataTypes.DATE, 	 	allowNull: true } },
        { "attribute": "updatedate", 		 			  constraints: { type: DataTypes.DATE, 	 	allowNull: true } }
			],
			"model_version": [
				{ "attribute": "modelid", 			 			  constraints: { type: DataTypes.BIGINT,  allowNull: true } },
				{ "attribute": "userid", 			 			  	constraints: { type: DataTypes.BIGINT,  allowNull: true } },
				{ "attribute": "creationdate", 	 			  constraints: { type: DataTypes.DATE, 	 	allowNull: true } }
			],
      "species": [
        { "attribute": "name", 					 			  constraints: { type: DataTypes.STRING,  allowNull: true } },
        { "attribute": "model_id", 		 			    constraints: { type: DataTypes.BIGINT,  allowNull: true } },
      ],
      "regulator": [
        { "attribute": "species_id", 			      constraints: { type: DataTypes.BIGINT,  allowNull: true } },
        { "attribute": "regulator_species_id",  constraints: { type: DataTypes.BIGINT,  allowNull: true } },
			],
			// "condition_species": [
			// 	{ "attribute": "species_id",						constraints: { type: DataTypes.BIGINT, 	allowNull: true } }
			// ]
    };
    
    Object.keys(changeColumnConfig)
      .forEach(async tableName => {
        const attributes = changeColumnConfig[tableName];
        attributes.forEach(async a =>
          await queryInterface.changeColumn(
            tableName,
            a.attribute,
            a.constraints
          )
        )
      });

    return Object.keys(addColumnConfig)
      .forEach(async tableName => {
				const columnsConfig = addColumnConfig[tableName];
        columnsConfig.forEach(async columnConfig => {
          await queryInterface.addColumn(
            tableName,
            columnConfig.column,
            columnConfig.constraints
					);
					
					if ( columnConfig.then ) {
						await columnConfig.then(queryInterface, DataTypes);
					}
				})
      });
  },
  down: async queryInterface => {
    Object.keys(tableConfiguration)
      .forEach(async tableName => {
        await queryInterface.dropTable(tableName)
			});
			
		queries.down.forEach(async query => await queryInterface.sequelize.query(query))

    Object.keys(tablesExtensions)
      .forEach(async tableName =>
        Object.keys(defaultAttributes)
          .forEach(async attribute =>
            await queryInterface.removeColumn(
              tableName,
              attribute
            )
          )
      );

    return Object.keys(addColumnConfig)
      .forEach(tableName => {
        const columnsConfig = addColumnConfig[tableName];
        columnsConfig.forEach(async columnConfig =>
          await queryInterface.removeColumn(
            tableName,
            columnConfig.column
          )
        )
      });
  }
};
