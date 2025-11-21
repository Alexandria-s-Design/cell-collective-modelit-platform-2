import { PerformAnalyzeInput } from "./DrugIdentification";
import fs from "fs";

const TIME_EXCEEDED = 45; //minutes
export const LIMIT_REQ_ATTEMPT = 900;

// Entity working for Data Object
export class DrugExperimentFields {
	constructor() {
		this.exper_type = 'DRUG';
		this.updatedate = new Date();
	}
	set addId (value) {
		this.id = value;
	}
	set addName (value) {
		this.name = value;
	}
	set addCreationdate (value) {
		this.creationdate = value;
	}
	set addPublished (value) {
		this.published = value;
	}
	set addSettings (value) {
		this.settings = value;
	}
	set addShared (value) {
		this.shared = value;
	}
	set addUpdatedate (value) {
		this.updatedate = value;
		this._updatedAt = value;
	}
	set addModelId (value) {
		this.model_id = value;
	}
	set addUserId (value) {
		this.userid = value;
	}
	set addState (value) {
		this.state = value;
	}
	set addExperType (value) {
		this.exper_type = value;
	}
	set addErrMessage (value) {
		this.err_msg = value;
	}
	set addDeleted (value) {
		this._deleted = value;
	}
}


const EXP_RUNNING = 'RUNNING';
const EXP_COMPLETED = 'COMPLETED';
export class DrugExperimentStatus {
	activeRunning() {
		this.status = EXP_RUNNING;
	}
	activeCompleted() {
		this.status = EXP_COMPLETED;
	}
	constructor(experId, errMsg = '') {
		this.experId = experId;
		if (errMsg) {
			this.errMsg = `${errMsg}`.substring(0,200);
		}		
	}
	static typeRunning() {
		return EXP_RUNNING;
	}
	static typeCompleted() {
		return EXP_COMPLETED;
	}
}

export class DrugPrevExperiment {
	constructor(fields = DrugExperimentFields, input = PerformAnalyzeInput) {
		this.input = input;
		this.fields = fields;
	}
}

export class DrugParseScores {
	constructor(scorePath) {
		this.cols = [];
		this.rows = [];
		this.score_path = scorePath;

		let content = fs.readFileSync(scorePath).toString('utf8');
		content = content.split('\n');

		let _cols = content[0].split('\t');

		for (const col of _cols) {
			this.cols.push({
				id: `${col}`.toLowerCase(),
				label: `${col}`.toUpperCase()
			});
		}

		if (content.length==2 && content[1] == '') {
			content[1] = Array.from({length: _cols.length}, ()=> '-').join('\t');
		}

		for (let i=1; i<content.length; i++) {
			let _rows = content[i].split('\t');
			if (_rows.length > 1) {
				let newRows = {};
				for (let j=0; j<_rows.length; j++) {
					newRows[this.cols[j].id] = _rows[j];
				}
				this.rows.push(newRows);
			}
		}
	}

	getCols() {
		return this.cols;
	}

	getRows() {
		return this.rows;
	}
}

export default class DrugExperiment {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
	}


	async createExperiment(data = DrugExperimentFields) {
		if (!data.name) {
			throw new Error('The experiment cannot be registered because name is missing');
		}
		const dt = this.dbInstance.sequelize.fn('NOW');
		data.addId = this.dbInstance.sequelize.fn('nextval', this.dbInstance.sequelize.literal("'experiment_id_seq'"));
		data.shared = false
		data.published = false;
		data.addCreationdate = dt;
		data.addUpdatedate = dt;
		return this.dbInstance.experiment.create(data)
	}

	async updateExperiment(data = DrugExperimentFields) {
		if (!data.id) {
			throw new Error('The experiment cannot be registered because ID is missing');
		}
		const dt = this.dbInstance.sequelize.fn('NOW');
		data.addUpdatedate = dt;
		data.addErrMessage = '';
		return this.dbInstance.experiment.update(data, {
			where: { id: data.id }
		});
	}

	async getExperimentById(id = 0) {
		return this.dbInstance.experiment.findOne({
			where: { id }
		});
	}

	async getExperimentData(experId = 0) {
		return this.dbInstance.experiment.findOne({
			where: { id: experId }
		});
	}

	async checkIfExperimentShouldRun(exper = new DrugPrevExperiment()) {
		try {
			const expersData = await this.dbInstance.experiment.findAll({
				attributes: [
					'id','creationdate',
					[this.dbInstance.sequelize.literal(`to_char(creationdate, 'YYYY-MM-DD HH:MI:SS')`), 'created_str'],
					[this.dbInstance.sequelize.literal(`creationdate < NOW() - INTERVAL '${TIME_EXCEEDED} minutes'`),	'time_exceeded']
				],
				where: {
					userid: exper.fields.userid,
					model_id: exper.fields.model_id,
					state: EXP_RUNNING,
					exper_type: exper.fields.exper_type
				}
			});
			if (expersData && expersData.length) {
				const runningList = [];
				for (const experData of expersData) {
					if (experData.dataValues.time_exceeded == true) {
						runningList.push(experData.dataValues);
						const experStatus = new DrugExperimentStatus(experData.id, `Canceled by time exceeded. More than ${TIME_EXCEEDED}min`);
						experStatus.activeCompleted();
						await this.changeExperimentStatus(experStatus);
					}
				}
				if (runningList.length == 0) {
					throw new Error(`This model already has a state of '${EXP_RUNNING}'. ID: ${runningList.map(v => v.id).join('; ')}`);
				}				
			}
		} catch (err) { throw err; }
	}

	async changeExperimentStatus(data = DrugExperimentStatus, dataCols = []) {
		const dt = this.dbInstance.sequelize.fn('NOW');
		
		let exprColumns = {
			updatedate: dt,
			_updatedAt: dt,
			state: data.status,
			err_msg: data.errMsg
		}

		for (let col of dataCols) {
			exprColumns[col[0]] = col[1];
		}

		return this.dbInstance.experiment.update(exprColumns, {
			where: { id: data.experId }
		});
	}

}