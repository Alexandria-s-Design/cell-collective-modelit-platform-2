import Entity from "../Entity";
import {Seq} from "immutable"

export default class PKCompartment extends Entity {

	contains(compartment) {
		const f = e => e.compartment === compartment;
		return Seq(this.upStreams).some(e => f(e));
	}

	neighbors(nodes, edges) {
		const add = (s, t, type) => {
			const sid = s.id;
			const tid = t.id;
			const e = edges[sid] || (edges[sid] = {});
			const v = e[tid];
			v ? v.type !== type && (v.type = 2) : (e[tid] = { source: sid, target: t, type: type });
			nodes[sid] = s;
			nodes[tid] = t;
		};
		nodes[this.id] = this;
		const adds = (e, f) => Seq(e).forEach(e => f(e));

		Seq(this.upStreams).forEach(e => 	add(e.toCompartment, this, e.type));
		adds(this.downStreams, e => add(this, e.fromCompartment, e.type));
	}
}

Entity.init({ PKCompartment }, {
	name: null,
	type: null,
	cmp: null,
	extType: null,
	x: null,
	y: null
}, {
	upStreams: false,
	downStreams: false,
});