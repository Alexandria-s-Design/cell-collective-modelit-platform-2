import Sequelize from "sequelize"

const tableConfig = {
	addColumn: [
		{ table: "profile", columnName: "thirdPartyId",    args: {type: Sequelize.STRING(255), allowNull: true}},
		{ table: "profile", columnName: "thirdPartyType",  args: {type: Sequelize.STRING(50) , allowNull: true}},
		{ table: "profile", columnName: "alternateEmails", args: {type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true}},
		{ table: "profile", columnName: "avatarUri", 			 args: {type: Sequelize.STRING,      allowNull: true}},
	]
}

export default {
  up: async queryInterface => {
		tableConfig.addColumn.forEach(async ({ table, columnName, args }) =>
			await queryInterface.addColumn(table, columnName, args)
		)
  },

  down: async queryInterface => {
		return tableConfig.addColumn.forEach(async ({ table, columnName, args }) => 
			await queryInterface.removeColumn(table, columnName)
		);
  }
};
