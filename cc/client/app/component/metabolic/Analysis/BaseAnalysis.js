import { Seq, Map } from "immutable";

class BaseAnalysis {
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
		const path = ["Experiment", eType, id, ...p]
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
	}

	getExperimentModelJSON ( ) {
		const { props, experiment } = this;
		let { model, cc: {Model} } = props;
		let { selected: { ObjectiveFunction: eOF } } = props;
		const modelJSON = model.json;
	
		Model = Map(Model).first();
		modelJSON.id = Model.id;
		modelJSON.name = Model.name;
		
		const { environment } = experiment;

		if ( experiment ) {
			const objectiveFunctionId = experiment.objectiveFunctionId;

			if ( objectiveFunctionId ) {
				eOF = model.ObjectiveFunction[objectiveFunctionId];
			}
		}

		let objective	= null;

		if ( eOF ) {
			if ( !eOF.default ) {
				objective = Seq(Object.keys(eOF.reactions))
					.reduce((prev, next) => {
						const objectiveReaction = model.ObjectiveReaction[next];
						const reactionId = objectiveReaction.reactionId;
						const coefficient = objectiveReaction.coefficient;

						return {
							...prev,
							[reactionId]: coefficient
						}
					}, { })
			} else {
				objective = eOF.reactions;
			}
		}

		if ( environment && environment.envExperimentActivities ) {
			const activities = Seq(environment.envExperimentActivities);

			activities.forEach(activity => {
				for ( const reaction of modelJSON.reactions ) {
					if ( reaction.id == activity.reactionId ) {
						reaction.lowerBound = activity.min;
						reaction.upperBound = activity.max;
					}

					reaction.objectiveCoefficient = 0;

					if ( objective ) {
						if ( reaction.id in objective ) {
							reaction.objectiveCoefficient = objective[reaction.id]
						}
					}
				}
			});
		}

		if ( experiment.mutations ) {
			const mutations = Seq(experiment.mutations);
			const kGeneIds	= mutations
				.filter(m => m.state)
				.map(m => m.geneId)
				.toArray();

			const eGeneIds 	= mutations
				.filter(m => m.expressionState)
				.map(m => m.geneId)
				.toArray()

			const knockOutGenes = Seq(modelJSON.genes)
				.filter(gene => kGeneIds.includes(gene.id))
				.map(gene => ({ ...gene, knockOut: true }))
				.toArray()

			const expressionGenes = Seq(modelJSON.genes)
				.filter(gene => eGeneIds.includes(gene.id))
				.map(gene => ({ ...gene, expression: true }))
				.toArray();
			
			modelJSON.genes = Seq(modelJSON.genes)
				.filterNot(g => kGeneIds.includes(g.id) || eGeneIds.includes(g.id))
				.concat(knockOutGenes)
				.concat(expressionGenes)
				.toArray();
		}

		if ( objective ) {
			modelJSON.objective = Object.keys(objective);
		}
		
		return modelJSON;
	}

	/**
	 * This function replaces the entire model state, including the new FBA data
	 * In the case of React 18, it was removed the line: this.stateSet('data', experimentData);
	 */
	setExperimentData (experimentData) {		
		this.onExperimentSuccess({data: experimentData});
	}

	onExperimentSuccess ({ data: dataExper }) {
		const now = Date.now();
		const newState = {
			state: "COMPLETED",
			elapsedTime: Math.round(0.001 * (now - this.experimentStartTime)),
			percentComplete: 100
		}
		if (dataExper) {
			newState.data = dataExper;
		}
		this.stateSet(null, newState);
	}
}

export default BaseAnalysis;