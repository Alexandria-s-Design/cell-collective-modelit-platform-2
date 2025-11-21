import fs from "fs";
import path from "path";
import isEmpty from "lodash.isempty";
import { FileInputAssigned } from '../../../util/entities/fileInput';
import { generateKeyTime } from "../../../util/crypto";
import { promisify } from 'util';
import DateTimeUtil from "../../../util/DateTimeUtil";

const LIMIT_FILES = 3;
const LIMIT_SIZE_MB = 10;//MB;
const PRIVATE_TMP_UPLOADS = '/app/cc/private/tmp/uploads';

const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);

export function testPerformAnalyzeJsonReturn() {
	return `{\"up_regulated\": \"/app/cc/private/model/csv/up_reg_c8ea77e2-93ab-46cb-b1a1-c3d19be8300e.csv\",
			\"down_regulated\": \"/app/cc/private/model/csv/up_reg_c8ea77e2-93ab-46cb-b1a1-c3d19be8300e.csv\"}`
}

function performAnalyzeOutput(jsonStr) {
		try {
			let _parsing = jsonStr.split('\n');
			_parsing = _parsing.pop();
			_parsing = _parsing.trim().replace(/'/g, '\"');

			jsonStr = JSON.parse(_parsing);
			return {
				up_regulated: jsonStr.up_regulated,
				down_regulated: jsonStr.down_regulated
			}
		} catch(err) {
			throw new Error('PerformAnalyzeOutput has not a valid JSON as string: ==> ', jsonStr);
		}
}

//input = new PerformAnalyzeInput()
async function moveOrRenameFile(key, input, dir, fileName) {
	if (!key) {
		throw new Error('Please define key fro move or rename file')
	}
	if (!(key in input)) {
		throw new Error(`${key} does not exists into input`);
	}

	let new_path = path.resolve(dir, fileName)
	if (fs.existsSync(new_path)) {
		fs.unlinkSync(new_path);
	}
	try {
		fs.renameSync(input[key], new_path);
	} catch (err) {
		if (err.code === 'EXDEV') {
			await copyFile(input[key], new_path);
			await unlink(input[key]);
		} else {
			throw err;
		}
	}
	return new_path;
}

export function drugFileValidation(files, form) {

		let druglist = new FileInputAssigned('druglist', form['druglist']);
		let upregulated = new FileInputAssigned('upregulated', form['upregulated']);
		let downregulated = new FileInputAssigned('downregulated', form['downregulated']);			

		if (isEmpty(files)) {
			throw new Error(`Please upload valid CSV files (Upregulated and Downregulated).`);
		}

		for (const file of files) {
			if (Math.ceil(file.size / (1024 * 1024)) > LIMIT_SIZE_MB) {
				throw new Error(`CSV file "${file.originalname}" cannot be larger than ${LIMIT_SIZE_MB}M`);
			}
			if (!['text/plain', 'text/csv'].includes(file.mimetype)) {
				throw new Error(`CSV file "${file.originalname}" does not have a valid format: ${file.type}`);
			}
			if (file.originalname == upregulated.getValue()) {
				file.inputname = upregulated.getName();
			}
			if (file.originalname == downregulated.getValue()) {
				file.inputname = downregulated.getName();
			}				
			if (file.originalname == druglist.getValue()) {
				file.inputname = druglist.getName();
			}
		}

		if (files.length < LIMIT_FILES) {			
			throw new Error(`Please enter ${LIMIT_FILES} valid CSV files.`);
		}
}

export class PerformAnalyzeInput {
	constructor() {
		//this.tmp_dir = path.join("/uploads", "drug");
	}
	set addTmpDir(value) {
		this.tmp_dir = value;
	}
	//name of the tmp file
	set addDrugCsvPath(value) {
		this.drug_csv_path = value;
	}
	//name of the tmp file
	set addHealthy(value) {
		this.healthy = value;
	}
	//name of the tmp file
	set addDiseased(value) {
		this.diseased = value;
	}
	//DESEQ2
	set addStatistical(value) {
		this.statistical = value;
	}
	//Benjamini-Hochberg
	set addMethod(value) {
		this.method = value;
	}
	//number of maximum rows on the csv file
	set addMaxrows(value) {
		this.maxrows = value;
	}

	//directory for save results
	set addResultDir(value) {
		this.result_dir = value;
	}

	set addModelExported(value) {
		this.model_exported = value;
	}

	set addLogFile(value) {
		this.log_file = value;
	}

	set addUpregulated(value) {
		this.upregulated = value;
	}
	
	set addDownregulated(value) {
		this.downregulated = value;
	}

	set addTaxonId(value) {
		if (value == undefined) {value = ''}
		this.taxonId = value;
	}

	set addFluxRatioUp(value) {
		if (value == undefined) {value = 0}
		this.fluxRatioUp = value;
	}

	set addFluxRatioDown(value) {
		if (value == undefined) {value = 0}
		this.fluxRatioDown = value;
	}

	set addKnockoutMethod(value) {
		if (value == undefined) {value = ''}
		this.knockoutMethod = value;
	}

}

export function drugWriteLogs(logPath, logs = []) {
	if (logs.length == 1) {
		logs[0] = logs[0]+'\n';
	}
	fs.writeFileSync(logPath, logs.join('\n'), {flag: 'a+', encoding: 'utf8'});
}

export function drugMakeExportDir(dirRoot) {
	let exportsDir = path.resolve(dirRoot,'exports');
	if (!fs.existsSync(exportsDir)) {
		fs.mkdirSync(exportsDir, {recursive: true});
	}
	return exportsDir;
}

export async function drugRenameModelJSONFile(input = PerformAnalyzeInput, dir="newdir") {
	if (input.model_exported) {
		input.addModelExported = await moveOrRenameFile('model_exported', input, dir, 'model_export.json');
	}
}

export async function drugMoveListCSVFile(input = PerformAnalyzeInput, dir="newdir/tmp") {
	if (input.drug_csv_path) {
		const dt = new Date();
		let fileName = input.drug_csv_path.split('.');
		fileName = `drug_${DateTimeUtil.toStr(dt)}.${fileName[fileName.length-1]}`;
		let old_druglist = path.resolve(PRIVATE_TMP_UPLOADS, input.drug_csv_path);
		let new_druglist = path.resolve(dir, fileName);
		await copyFile(old_druglist, new_druglist);
		input.addDrugCsvPath = fileName;
	}
}

export async function drugMoveRNACSVFile(input = PerformAnalyzeInput, dir="newdir/tmp") {
	if (input.healthy) {
		let old_healthy = path.resolve(PRIVATE_TMP_UPLOADS, input.healthy);
		let new_healthy = path.resolve(dir, input.healthy);
		await copyFile(old_healthy, new_healthy);
		await unlink(old_healthy);
	}
	if (input.diseased) {
		let old_diseased = path.resolve(PRIVATE_TMP_UPLOADS, input.diseased);
		let new_diseased = path.resolve(dir, input.diseased);
		await copyFile(old_diseased, new_diseased);
		await unlink(old_diseased);
	}
}

export async function drugMoveRegulatedCSVFile(input = PerformAnalyzeInput, dir="newdir/tmp") {
	let dt = new Date();
	if (input.upregulated) {
		let fileName = input.upregulated.split('.');
		fileName = `upregulated_${DateTimeUtil.toStr(dt)}.${fileName[fileName.length-1]}`;

		let old_upregulated = path.resolve(PRIVATE_TMP_UPLOADS, input.upregulated);
		let new_upregulated = path.resolve(dir, fileName);
		await copyFile(old_upregulated, new_upregulated);
		//await unlink(old_upregulated);
		input.addUpregulated = fileName;
	}
	if (input.downregulated) {
		let fileName = input.downregulated.split('.');
		fileName = `downregulated_${DateTimeUtil.toStr(dt)}.${fileName[fileName.length-1]}`;

		let old_downregulated = path.resolve(PRIVATE_TMP_UPLOADS, input.downregulated);
		let new_downregulated = path.resolve(dir, fileName);
		await copyFile(old_downregulated, new_downregulated);
		//await unlink(old_downregulated);
		input.addDownregulated = fileName;
	}
}

export async function drugCreateRequiredFolders(modelId, experId) {

	if (!fs.existsSync('/uploads')) {
		throw new Error('Uploads directory does not exists in the environment!');
	}
	if (!experId) {
		throw new Error('Please define Experiment ID');
	}

	let drugRoot = path.resolve('/uploads','drug');

	if (!fs.existsSync(drugRoot)) {
		fs.mkdirSync(drugRoot);
	}

	let drugDir = path.resolve('/uploads','drug', modelId);
	
	let newDirName = experId;
	let hashContext = generateKeyTime();

	let newDir = path.join(drugDir, newDirName);		
	let logsDir = path.join(newDir, hashContext);
	let tmpDir = path.join(newDir, 'tmp');

	if (!fs.existsSync(drugDir)) {
		fs.mkdirSync(drugDir, true);
	}

	if (!fs.existsSync(newDir)) {			
		fs.mkdirSync(newDir);
	}

	if (!fs.existsSync(logsDir)) {
		fs.mkdirSync(logsDir);
	}

	if (!fs.existsSync(logsDir)) {
		fs.mkdirSync(logsDir);
	}

	if (!fs.existsSync(tmpDir)) {
		fs.mkdirSync(tmpDir);
	}

	let directories = {};
	directories.new = newDir;
	directories.tmp = tmpDir;
	directories.logs = logsDir;
	directories.root = drugDir;
	
	let logFile = path.resolve(logsDir, `logs.txt`);
	let logPath = `${modelId}\/${newDirName}\/${hashContext}`;

	drugWriteLogs(logFile, ['Analyze Initialization']);

	return {context: hashContext, directories, logFile, logPath}
}
export default class DrugIdentification {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
	}

	async performAnalyze(input = PerformAnalyzeInput) {

		try {
		
			if (!(input instanceof PerformAnalyzeInput)) {
				throw new Error('Input informed at perform analyze is not a valid instance of PerformAnalyzeInput');
			}

			const args 	= [
				"--action", "analyse",
				"--model-type", "metabolic",
				"--analysis-type", "drug",
				"--input", JSON.stringify(input)
			];
	
			// let analyzeJsonReturn = await CCPy(...args);

			let analyzeJsonReturn = JSON.stringify({
				status: 'success',
				msg: 'Gene D score mapped to repurposing drugs',
				file_result: 'drug_test_perform.csv'
			})

			const output = performAnalyzeOutput(analyzeJsonReturn);
			
			return output;

		} catch(err) {
			throw err
		}
	}

}