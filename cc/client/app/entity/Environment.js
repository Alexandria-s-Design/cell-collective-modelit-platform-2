import Entity from "./Entity";

export default class Environment extends Entity{}

Entity.init({Environment}, {
	name : {maxLength: 80},
	isDefault: { defaultVal: false } 
}, {
	envExperimentActivities : { nullable: false, Entity: "ExperimentActivity" } ,
	experiments: { nullable: true, property: "environment" },
	lastRunEnvironment: {nullable: true, property: "environment"}
});