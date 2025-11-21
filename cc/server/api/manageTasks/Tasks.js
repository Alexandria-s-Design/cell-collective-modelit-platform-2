import JsonFilter from "../../../util/JsonFilter";
import { doFilterSpecialChar } from "../../../util/JsonFilter";

export const TASKS_JOB = {
	IMPORT_SBML: "IMPORT_SBML",
}

export class StartTaskOptions {
	set addJob(value) {
		this.job = value;
	}
	set addName(value) {
		this.name = value;
	}
	set addFiles(value) {
		this.files = JSON.stringify(value);
	}
	set addStartedAt(value) {
		this.startedAt = value;
	}
	set addExecutedBy(value) {
		this.executedBy = value;
	}
	set addCreatedBy(value) {
		this._createdBy = value;
	}
	set addState(value) {
		this.state = value;
	}
	set addProgress(value) {
		this.progress = value;
	}
}

export default class Tasks {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('instance of Sequelize DB was not defined');
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	async startTask(data = new StartTaskOptions()) {
		if (!data.job) {
			throw new Error("Please define a Job name");
		}
		if (!data.name) {
			throw new Error("Please define a Task name");
		}
		data.addStartedAt = this.dbInstance.sequelize.fn('NOW');
		data.addCreatedBy = data.executedBy;
		data.addState = "LOADING";
		data.addProgress = 0;
		return await this.dbInstance.Tasks.create(data);
	}

	async finishTask(id, result=null, errorMsg=null, once=false) {
		return await this.dbInstance.Tasks.update({
			_updatedAt: this.dbInstance.sequelize.fn('NOW'),
			finishedAt: this.dbInstance.sequelize.fn('NOW'),
			state: !errorMsg ? 'DONE' : 'ERROR',
			progress: 100,
			failureMessage: errorMsg,
			resultDataType: 'JSON',
			resultData: (new JsonFilter(result)).toFilter(doFilterSpecialChar).getJson(),
			_deleted: once
		}, {
			where: { id },
		});
	}

	async checkTask(id) {
		return await this.dbInstance.Tasks.findOne({
			attributes: ['id', 'state', 'progress', 'job', 'resultData', 'failureMessage'],
			where: { id },
		});
	}
}
