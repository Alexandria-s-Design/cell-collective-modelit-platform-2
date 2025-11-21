import { Seq, Map } from "immutable";


class KineticAnalysis {
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
		const { experiment: e } = this;
		const modelJSON = this.getExperimentModelJSON();
		
		const params 	= {
			model: modelJSON,
			parameters: {
				num_timesteps: e.numTimesteps,
			}
		};

		const data 	= await cc.request.post(`${import.meta.env.VITE_ANALYZER_URL}/kinetic`, params);

		const eData = new Map(data);

		this.setExperimentData(eData);
	}

	getExperimentModelJSON () {
		const { props } = this;
		const { model } = props;
		// let { selected: { ObjectiveFunction: eOF } } = props;
		let modelJSON = model.json;
		
		if (modelJSON['reactions']) {
			modelJSON['reactions'] = modelJSON['reactions'].filter(x => x.kinetic_law);
		}

		// let objective	= null;

		// if ( eOF ) {
		// 	if ( !eOF.default ) {
		// 		objective = Seq(Object.keys(eOF.reactions))
		// 			.reduce((prev, next) => {
		// 				const objectiveReaction = model.ObjectiveReaction[next];
		// 				const reactionId = objectiveReaction.reactionId;
		// 				const coefficient = objectiveReaction.coefficient;

		// 				return {
		// 					...prev,
		// 					[reactionId]: coefficient
		// 				}
		// 			}, { })
		// 	} else {
		// 		objective = eOF.reactions;
		// 	}
		// }

		// if ( environment && environment.envExperimentActivities ) {
		// 	const activities = Seq(environment.envExperimentActivities);

		// 	activities.forEach(activity => {
		// 		for ( const reaction of modelJSON.reactions ) {
		// 			reaction.objectiveCoefficient = 0;

		// 			if ( objective ) {
		// 				if ( reaction.id in objective ) {
		// 					reaction.objectiveCoefficient = objective[reaction.id]
		// 				}
		// 			}
		// 		}
		// 	});
		// }
		
		return modelJSON;
	}

	setExperimentData (experimentData) {
		this.stateSet("data", experimentData);
		actions.onEditModelState("Kinetic", "Experiment", new Map(experimentData));

		this.onExperimentSuccess();
	}

	onExperimentSuccess () {
		this.stateSet(null, {
			state: "COMPLETED",
			elapsedTime: Math.round(0.001 * (Date.now() - this.experimentStartTime)),
			percentComplete: 100
		});
	}
}

export default KineticAnalysis;
