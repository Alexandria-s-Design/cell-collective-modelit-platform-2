import { Seq } from "immutable";
import Entity from "./Entity";

export default class Experiment extends Entity {
	select() {
		return [this.validRanges.maxBy(e => e.to) || "OutputRange"].concat(this.flow && this.flow.select());
	}

	get validRanges() {
		return Seq(this.ranges).filter(e => e.from !== e.to);
	}
}

Entity.init({Experiment}, {
	name: { maxLength: 100 },
	type: null,
	experimentType: null,
	isPublic: null,
	created: null,
	numSimulations: null,
	bits: null,
	bitsAvailable: null,
	initialStateId: { ref: "experiments", type: "InitialState" },
	flowId: { ref: "experiments", type: "Flow" },
	environmentId: { ref: "experiments", type: "Environment"},
	drugEnvironmentId: { ref: "experiments", type: "DrugEnvironment"},
	state: null,
	lastRun: null,
	userId: null,
	sliderWindow: { defaultVal: 50 },
	lastRunEnvironmentId : { ref: "lastRunEnvironment", entity: "Environment" },
	lastRunDrugEnvironmentId : { ref: "lastRunDrugEnvironment", entity: "DrugEnvironment" },
	x: { fromRaw: (v, m) => m && Seq(m.Component).get(v+""), toRaw: (v) => v && (v = v._id || v.id) && parseInt(v) },
	y: { fromRaw: (v, m) => Seq(v||[]).map(e=>Seq(m.Component).get(e+"")).filter(e=>e).toMap(), toRaw: (v) => ((v = Seq(v).map(v=>parseInt(v._id || v.id)).toArray()).length ? v : undefined) },

	// Metabolic Extensions
	fbaType: null,
	objectiveFunctionId: { ref: "experiments", type: "ObjectiveFunction" },

	// FVA Settings
	fvaOptimum: { defaultVal: 100 },

	// Context-Specific Extensions
	expressionState: null,
	fluxThreshold: { defaultVal: 0.9 },
	objectiveFraction: { defaultVal: 0.9 },
	expressedThreshold: null,
	
	// Kinetic Extensions
	numTimesteps: { defaultVal: 100 },

	// Drug identification
	drugSimulation: null,
	experType: null,
	errMsg: null,
	
	parameters: null,
}, {
	mutations: { nullable: false, entity: "ExperimentMutation" },
	// activities: { nullable: false, entity: "ExperimentActivity" },
	ranges: false
});

Experiment.transientTime = 500;
Experiment.runTime = 800;
Experiment.maxRunTime = 10000;