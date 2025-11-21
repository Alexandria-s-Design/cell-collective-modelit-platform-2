import { Seq } from "immutable";
import Graph from "../graph";
import cachedGraph from "./cachedGraph";

export default cachedGraph("Biologic", false, owner => {
	const nodes = {};
	const add = e => nodes[e.id] || (nodes[e.id] = { label: e.component.name, style: Graph.regulatorStyleMap[e.type] });
	const edge = Graph.edgeStyleMap[false];
	return {
		edges: Seq(owner.upStreams).filterNot(e => e.type).map(e => Seq(e.recessives).filter(e => e.positive.type)).flatten(true).map(e => ({ source: add(e.negative), target: add(e.positive), style: edge })).toArray(),
		nodes: Seq(nodes)
	};
});