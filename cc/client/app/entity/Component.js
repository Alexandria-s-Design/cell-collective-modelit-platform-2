import { Seq } from "immutable";
import Entity from "./Entity";

export default class Component extends Entity {
	expression(f) {
		const id = (m, e) => (e = f(e), m && (m[e] = true), e);
		const set = (e, r, m, f) => {
			let s = Seq(e);
			f && (s = s.filter(f));
			const c = s.count();
			s = s.map(m).join(r ? " && " : " || ");
			return c ? (c > 1 ? ("(" + s + ")") : s) : "";
		};
		const regulator = (m, e) => {
			const conditions = set(e.conditions, e.conditionRelation, condition.bind(null, m), e => e.components);
			return conditions ? ("(" + id(m, e.component) + " && " + conditions + ")") : id(m, e.component);
		};
		const condition = (m, e) => {
			const t = e.form ? "" : "!";
			const components = set(e.components, e.componentRelation, e => t + id(m, e.component));
			const conditions = set(e.conditions, e.subConditionRelation, condition.bind(null, m), e => e.components);
			return components && conditions ? ("(" + components + " && " + conditions + ")") : (components + conditions);
		};

		const ids = this.absentState && {};
		const a = () => (ids ? " || !(" + Seq(ids).map((_, k) => k).join(" || ") + ")" : "");
		const r = regulator.bind(null, ids);
		const regulators = Seq(this.upStreams);
		if (regulators.find(e => e.type)) {
			const dominants = regulators.filterNot(e => e.type).map(r).toObject();
			return set(this.upStreams, false, e => {
				const s = set(e.dominants, false, e => dominants[e.negativeId]);
				return r(e) + (s && (" && !(" + s + ")"));
			}, e => e.type) + a();
		}
		const s = set(this.upStreams, false, r);
		return s ? "!(" + s + ")" + a() : (ids ? "true" : "false");
	}

	get inputs() {
		const result = {};
		const f = e => result[e.componentId] = e.component;
		const fc = e => Seq(e.components).forEach(f);
		Seq(this.upStreams).forEach(e => f(e) && Seq(e.conditions).forEach(e => fc(e) | Seq(e.conditions).forEach(fc)));
		return result;
	}

	contains(component) {
		const f = e => e.component === component;
		const fc = e => Seq(e.components).some(f);
		return Seq(this.upStreams).some(e => f(e) || Seq(e.conditions).some(e => fc(e) || Seq(e.conditions).some(fc)));
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
		Seq(this.upStreams).forEach(e => (add(e.component, this, e.type), Seq(e.conditions).forEach(e => (adds(e.components, e => add(e.component, this, 2)), Seq(e.conditions).forEach(e => adds(e.components, e => add(e.component, this, 2)))))));
		adds(this.downStreams, e => add(this, e.parent, e.type));
		adds(this.conditions, e => add(this, e.root, 2));
		adds(this.subConditions, e => add(this, e.root, 2));
	}
}

Entity.init({ Component }, {
	isExternal: null,
	name: { maxLength: 100 },
	absentState: null,
	x: null,
	y: null
}, {
	upStreams: false,
	downStreams: false,
	conditions: false,
	subConditions: false,
	interactions: { nullable: false, key: "sourceId" },
	interactionTargets: false,
	initialStates: { nullable: false, key: "parentId" },
	experimentMutations: { nullable: false, key: "parentId" },
	experimentActivities: { nullable: false, key: "parentId" },
	flowMutations: { nullable: false, key: "parentId" },
	flowActivities: { nullable: false, key: "parentId" },
	simulationMutations : { nullable: false, key: "parentId"},
	simulationActivities: {nullable: false, key: "parentId"},
	pages: false,
	layouts: false
});