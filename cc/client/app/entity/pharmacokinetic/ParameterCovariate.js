import Entity from "../Entity";

export default class ParameterCovariate extends Entity { }

Entity.init({ ParameterCovariate }, {
	name: null,
	type: null,
	functionId: { ref: 'functions' },
	parameterId: { ref: 'covariates'},
}, {});