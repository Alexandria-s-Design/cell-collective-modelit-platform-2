/**
 * This file is part of the dump used to start the application
 */

'use strict';
import fs from 'fs';
import path from 'path';
import SaveModel, {SaveModelSettings} from "../server/api/manageModel/SaveModel";
import models from "../models";

const user_data = {
	id: 1,
	email: 'cchlteachertest@gmail.com'
}

module.exports = {
  async up(queryInterface, Sequelize) {

    let modelName = 'Escherichia coli O139:H28 str. E24377A';
		let sqlStmt = "select count(1) as total from model m where m.\"name\" = '"+modelName+"'";

		const count = await queryInterface.sequelize.query(sqlStmt, { type: Sequelize.QueryTypes.SELECT });

		if (count[0].total > 1) {
			console.log(`\t==> Model ${modelName} has already been imported successfully`);
			return;
		}

		const cbmFile = fs.readFileSync(path.resolve(
			__dirname, '..','data', 'seed_data',
			'Escherichia_coli_O139_H28_str_E24377A.json'
		), {encoding: 'utf8'});

		const settings = new SaveModelSettings({
			user: {id: user_data.id},
			model: JSON.parse(cbmFile.toString("utf-8")),
			modelType: 'metabolic',
			enableCache: false,
			enableLogging: false,
			enablePublish: true
		});
		let saveData = new SaveModel(models, null, settings);
		saveData = await saveData.saveJSON();
		let jsonData = saveData.toJSON();
		console.log(`\t==> Model ${jsonData.id} - ${modelName} was imported successfully`);
  },

  async down(queryInterface, Sequelize) {
  }

};