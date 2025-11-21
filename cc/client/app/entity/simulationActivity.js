import Entity from "./Entity";

export default class SimulationActivity extends Entity{}

Entity.init({SimulationActivity}, {
	// simulationId: { ref: "activities" },
	componentId: { ref: "simulationActivities" },
	parentId: {ref : "envSimulationActivities"},
	value: null
});