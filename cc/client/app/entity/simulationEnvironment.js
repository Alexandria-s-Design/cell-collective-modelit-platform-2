import Entity from "./Entity";

export default class SimulationEnvironment extends Entity{}

Entity.init({SimulationEnvironment}, {
	name: { maxLength : 80}
}, {
	envSimulationActivities : { nullable: false, key: "parentId" } ,
	// simulations:{ nullable: false, property: "environment" }
});