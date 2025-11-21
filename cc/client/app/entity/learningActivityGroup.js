import Entity from "./Entity";

export default class LearningActivityGroup extends Entity {}

Entity.init({LearningActivityGroup}, {
	name: null,
	position: null,
},{
	activities: false
});
