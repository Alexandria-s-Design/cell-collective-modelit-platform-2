import { Seq, Map } from "immutable";

class PbpkAnalysis {
	constructor (context, experiment, props) {
		this.context		= context;
		this.experiment	= experiment
		this.props 			= props;
	}

	stateSet (p, newState) {
		p = p ? typeof p === "string" ? [p] : p : [];
		
		const { context: c, experiment: e } = this;
		const { state } = c;
		const { top: { id }, experimentType: eType } = e;

		const key = c.stateGetKey(state)
		const path = ["Experiment", "", id, ...p]
		const curState = state[key].getIn(path)

		c.stateSetInternal(
			state,
			path,
			curState ? curState.merge(newState) : new Map(newState)
		)
	}

	beforeRun ( ) {
		this.experimentStartTime = Date.now();

		const { context: c, experiment: e } = this;
		const { state } = c;
		const { top: { id }, experimentType: eType } = e;

		const key = c.stateGetKey(state)
		const initState = {
			state: "RUNNING",
			elapsedTime: 0,
			percentComplete: 0
		}

		this.stateSet(null, initState)
	}

	async run ( ) {
		this.beforeRun();

		// const { experiment: e } = this;
		const modelJSON = this.getExperimentModelJSON();

		const numTimesteps = this.props.modelState.getIn(["simulation", "endTime"]);
		const stepSize = this.props.modelState.getIn(["simulation", "stepSize"]);
		const populationSize = this.props.modelState.getIn(["simulation", "subjectCount"]);
		
		const params 	= {
			model: modelJSON,
			parameters: {
				num_timesteps: numTimesteps,
				step_size: stepSize,
				population_size: populationSize
			}
		};

		const { data } 	= await cc.request.post(`${import.meta.env.VITE_ANALYZER_URL}/pbpk`, params);


		const eData = new Map(data);

		this.setExperimentData(eData);
	}

	getExperimentModelJSON () {
		const { model } = this.props;
		const modelJSON = model.json;

		return modelJSON;
	}

	setExperimentData (experimentData) {
		this.props.actions.onEditModelState(["simulation", "data"], experimentData);
		
		this.onExperimentSuccess();
	}

	onExperimentSuccess () {
		const now = Date.now();

		this.stateSet(null, {
			state: "COMPLETED",
			elapsedTime: Math.round(0.001 * (now - this.experimentStartTime)),
			percentComplete: 100
		});
	}
}

export default PbpkAnalysis;