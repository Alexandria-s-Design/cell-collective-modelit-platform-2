import Entity from "./Entity";

export default class Interaction extends Entity {
	static remove(e, context, entities) {
		let i, root = e.root || e.parent;
		(i = root.interactions) && (i = i[e.componentId]) && !root.contains(e.component) && i.delete(context, entities);
	}
}

Entity.init({Interaction}, {
	targetId: { ref: "interactions" },
	sourceId: { ref: "interactionTargets" },
	delay: null,
	threshold: null
});

Interaction.maxDelay = 1000;
Interaction.minThreshold = -100;
Interaction.maxThreshold = 100;