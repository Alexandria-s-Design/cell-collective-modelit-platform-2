import { Seq } from "immutable";
import { convertXlsToCsv } from "../../../util/xlsToCsv";
import fs from "fs";
import { generateHash } from "../../../util/crypto";

const SETTINGS_PROPS = [
	"settings",
	"typeProteomics",
	"typeDataMerging",
	"typeBulkTotalRNA",
	"typeBulkPolyaRNA",
	"typeSingleCellRNA"
];

const DATA_PROPS = [
	"excludeReactions",
	"boundaryReactions",
	"coreForceReactions"
]

const CONTEXT_TYPES = [
	'iMAT', 'GIMME', 'FASTCORE'
]

function getContextType(type) {
	if (CONTEXT_TYPES.includes(type)) { return type }
	return null
}

function isXLS(mimeType) {
	let valid = false;
	if (mimeType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
		valid = true;
	} else if (mimeType == 'application/vnd.ms-excel') {
		valid = true;
	} else if (mimeType == 'application/vnd.ms-excel.sheet.macroenabled.12') {
		valid = true;
	}
	return valid;
}

export default class ContextSpecific {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	async createContextData(modelOriginId, data, files, userId) {	
		const contextSettings = {
			_createdBy: userId, _updatedBy: userId, modelOriginId, settings: {}, uploads: {}
		};
		const contextDataBulk = [];

		data.forEach((values, key) => {
			if (key == 'contextType') {
				contextSettings[key] = getContextType(`${values}`.replace(/\"/g,''));
			} else if (SETTINGS_PROPS.includes(key)) {
				contextSettings.settings[key] = JSON.parse(values);
				if ('upload' in contextSettings.settings[key]) {
					delete contextSettings.settings[key].upload;
				}
			} else if (DATA_PROPS.includes(key)) {
				const data = JSON.parse(values);
				delete data.upload;
				contextDataBulk.push({
					_createdBy: userId, _updatedBy: userId, dataType: key, data
				})
			}
		});

		files.forEach((file, kFile) => {
			let key = `${file.fieldname}`.split(':'); key = key[1] || key[0];
			contextSettings.uploads[key] = {}
			//convert XLS to CSV type
			if ([
				'typeSingleCellRNA', 'typeProteomics',
				'typeBulkTotalRNA', 'boundaryReactions',
				'coreForceReactions', 'excludeReactions'
			].includes(key) && isXLS(file.mimetype))
			{
				let buffXLS = fs.readFileSync(file.path);
				let csvName = `${file.filename}`.replace(/(.xls|.xlsx)$/g, '.csv');
				let csvDest = `${file.destination}/${csvName}`;
				convertXlsToCsv(buffXLS, csvDest);
				contextSettings.uploads[key].converted = {from: file.mimetype, to: 'text/csv'}				
				files[kFile].path = csvDest;
				files[kFile].filename = csvName;
				files[kFile].mimetype = 'text/csv';
			}
			contextSettings.uploads[key].size = file.size;
			contextSettings.uploads[key].path = 'context/inputs/'+file.filename;
			contextSettings.uploads[key].name = file.originalname;
			contextSettings.uploads[key].mimetype = file.mimetype;
		});

		const transaction = await this.dbInstance.sequelize.transaction();

		try {
			const newContext = await this.dbInstance.ModelContext.create(contextSettings, {transaction});
			await this.dbInstance.ModelContextData.bulkCreate(
				contextDataBulk.map(c => {
					c.modelContextId = newContext.id
					return c;
				}),
			{ transaction });
			await transaction.commit();
			return newContext.toJSON();
		} catch(err) {
			await transaction.rollback();
			throw new Error(`Unable to create Context. ${err.message}`);
		}
	}

	async setDownloads(contextId, data) {
		await this.dbInstance.ModelContext.update(
			{
				downloads: data,
				_updatedAt: this.dbInstance.sequelize.fn('NOW'),
			},
			{where: {
				id: contextId
			}}
		)
	}

	async getAllContextData(modelOriginId) {	
		return await this.dbInstance.ModelContext.findAll({
			attributes: [
				"id",	"contextType", "modelId", "modelOriginId", "downloads", "_createdAt"
			],
			where: {
				modelOriginId
			}
		})
	}

	async createContextModel(saveJSONModelFn) {
		if (typeof saveJSONModelFn == 'function') {
			let mBaseModel = await saveJSONModelFn();
			return mBaseModel.id;
		}
		return null;
	}

	parseModelJson(pathModel, {contextId, modelOrigId}) {
		let file;
		try {
			file = fs.readFileSync(pathModel, {encoding: 'utf8'});
		} catch(err) {
			throw new Error('Context Model JSON not loaded: '+pathModel+'. '+err.message+'.');
		}
		file = JSON.parse(file.toString());
		if ('name' in file) {
			file['name'] =  `${modelOrigId}_${contextId}_SpecificModel_${file['name']}`;
		} else {
			file['name'] =  `${modelOrigId}_${contextId}_SpecificModel`;
		}
		return file;
	}

}