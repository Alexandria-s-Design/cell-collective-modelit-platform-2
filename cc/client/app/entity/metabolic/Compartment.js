import Entity from "../Entity";

export default class Compartment extends Entity { }

Entity.init({ Compartment }, {
	compartmentId:  null, 
	name:           null
}, {
	metabolites: true
});