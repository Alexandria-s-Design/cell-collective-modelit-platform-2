import { Seq } from "immutable";
import Graph from "../graph";
import cachedGraph from "./cachedGraph";

export default cachedGraph("Component", true, owner => {
	let nodes = {}, edges = {};
	owner.neighbors(nodes, edges);
	Seq(nodes).filterNot(e => e === owner).cacheResult().forEach(e => e.neighbors(nodes, edges));
	nodes = Seq(nodes).map(e => ({ uniqid: e.id, label: e.name, style: e === owner ? "selected" : Graph.nodeStyleMap[e.isExternal] })).toMap();
	return { nodes: nodes, edges: Seq(edges).map((e, s) => Seq(e).map((e, t) => ({ source: nodes.get(s.toString()), target: nodes.get(t.toString()), style: Graph.edgeStyle(e)}))).flatten(true).toArray() };
});
