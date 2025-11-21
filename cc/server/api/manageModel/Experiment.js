import { XMLParser } from "../../../util/xml";

function filterSettings(xmlSettings) {
	let elementsXml = {};
	if (!('drugSimulationSettings' in xmlSettings)) {
		return null;
	}
	let docXml = xmlSettings.drugSimulationSettings;
	
	elementsXml.dirdata = docXml.dirdata ? docXml.dirdata.replace('/uploads/', '') : null;
	elementsXml.drugcsvpath = docXml.drugcsvpath ? docXml.drugcsvpath.replace('/uploads/', '') : null;
	
	if (docXml.upregulated) {
		elementsXml.upregulated = docXml.upregulated.replace('/uploads/', '');
	}
	if (docXml.downregulated) {
		elementsXml.downregulated = docXml.downregulated.replace('/uploads/', '');
	}
	if (docXml.logfile) {
		elementsXml.logfile = docXml.logfile.replace('/uploads/', '');
	}
	if (docXml.modeljson) {
		elementsXml.modeljson = docXml.modeljson.replace('/uploads/', '');
	}	
	return elementsXml;
}

export default class Experiment {

	constructor(modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. ' + __filename);
		}
		this.dbInstance = modelInstance;
	}

	async getExperimentMap(modelId, type) {

		let where = {
			model_id: modelId,
			_deleted: {[this.dbInstance.Sequelize.Op.not]: true }
		}

		if (type) {
			where.exper_type = type;
		}

		let expers = await this.dbInstance.experiment.findAll({
			attributes: [
				"id",
				"settings",
				["name", "name"],
				["state", "state"],
				["userid", "userId"],
				["courseid", "courseId"],
				["shared", "shared"],
				["published", "published"],
				["creationdate", "creationDate"],
				["updatedate", "updateDate"],
				["lastrundate", "lastRunDate"],
				["lastaccessdate", "lastAccessDate"],
				["updatetype", "updateType"],
				[this.dbInstance.sequelize.literal(`0`), "calcIntervals"],
				["environmentid", "environmentId"],
				["lastrunenvironmentid", "lastRunEnvironmentId"],
				["exper_type", "experType"],
				["err_msg", "errMsg"],
			],
			where,
			order: [['id', 'ASC']]
		});
		let toMap = {};
		expers.forEach(experData => {
			let exper = {...experData.dataValues};
			delete exper.id;
			delete exper.settings;

			let id = experData.id;
			let simulationXml = null;

			try {
				let xmlDoc = XMLParser.parseFromString(experData.settings);				
				simulationXml = filterSettings(xmlDoc);
			}	catch(_){}

			exper["userId"] = parseInt(exper["userId"]);
			exper["bitsAvailable"] = false;
			exper["activityLevelRange"] = '';
			exper["x"] = null;
			exper["y"] = null;
			exper["simulations"] = 100;
			exper["bits"] = false;
			exper["initialStateId"] = null;
			exper["mutations"] = null;
			exper["drugSimulation"] = simulationXml;
			toMap[id] = exper;
		});
		return toMap;
	}

}	