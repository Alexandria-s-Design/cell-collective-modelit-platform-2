import fs from "fs";


export class PerformSolverInput {
	constructor(dir) {
		//Save scores file
		this.dir_data = dir;
		this.test_result = false;
	}

	//name of the tmp file
	set addDrugCsvPath(value) {
		this.drug_csv_path = value;
	}

	//name of the model/csv file
	set addUpRegulated(value) {
		this.up_regulated = value;
	}

	//name of the model/csv file
	set addDownRegulated(value) {
		this.down_regulated = value;
	}

	// Model name
	set addContextName(value) {
		this.context_name = value;
	}

	//Type of solver
	set addSolver(value) {
		this.solver = value;
	}

	set addModelExported(value) {
		this.model_exported = value
	}

	set addTestResult(value) {
		this.test_result =  value
	}

	set addTaxonId(value) {
		this.taxonId = value;
	}

	set addFluxRatioUp(value) {
		this.fluxRatioUp = value;
	}

	set addFluxRatioDown(value) {
		this.fluxRatioDown = value;
	}

	set addKnockoutMethod(value) {
		this.knockoutMethod = value;
	}
}

export default class DrugSolver {

	constructor(modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. ' + __filename);
		}
		this.dbInstance = modelInstance;
	}

	async performSolver(args= PerformSolverInput) {

		try {

			const defaulsArgs = [
				"--action", "analyse",
				"--model-type", "metabolic",
				"--analysis-type", "drug_solver",
				"--input", JSON.stringify(args),
			];

			// let drugScorePath = await CCPy(...defaulsArgs);

			let drugScorePath = JSON.stringify({
				status: 'success',
				msg: 'Gene D score mapped to repurposing drugs',
				file_result: 'drug_test_solver.csv'
			})

			return drugScorePath;

		} catch (err) {
			throw err
		}
	}


}