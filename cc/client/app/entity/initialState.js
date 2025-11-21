import Entity from "./Entity";

export default class InitialState extends Entity {}

Entity.init({InitialState}, {
	name: { maxLength: 80 }
}, {
	components: false,
	experiments: { nullable: true, property: "initialState" },
	initialStateParents: true
});