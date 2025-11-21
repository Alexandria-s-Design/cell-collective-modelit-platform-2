import Entity from "./../Entity";

export default class DrugEnvironment extends Entity{}

Entity.init({DrugEnvironment}, {
	name : {maxLength: 60},
	isDefault: { defaultVal: false } 
}, {
	envExperimentDrugList : { nullable: false, Entity: "DrugScore" } ,
	experiments: { nullable: true, property: "drugEnvironment" },
	lastRunEnvironment: {nullable: true, property: "drugEnvironment"}
});