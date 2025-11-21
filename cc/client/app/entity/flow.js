import { Seq } from "immutable";
import Entity from "./Entity";

export default class Flow extends Entity {
	select() {
		return [Seq(this.ranges).minBy(e => e.from) || "FlowRange"];
	}

	build(f) {
		const s = Seq(this.ranges || {});
		const t = (e, p, f) => e.map(e => Seq(e[p] || {}).mapEntries(([_, e]) => [e.componentId || e.reactionId, f(e)]).filter(e => e)).flatten(true).toObject();
		const result = s.mapEntries(([k, v]) => [v.from, null]).concat(s.mapEntries(([k, v]) => [v.to, null])).toMap().map((e, k) => (e = s.filter(e => e.from <= k && e.to > k).sortBy(e => e.to - e.from).reverse().cacheResult(),
		{ from: k, mutations: t(e, "mutations", e => e.state), activities: t(e, "activities", f) })).sortBy((_, k) => k).toArray();

		!(result.length && !result[0].from) && result.unshift({ from: 0, mutations: {}, activities: {} });
		if (result.length > 1) {
			let p = {};
			result.forEach(e => (p.to = e.from, p = e));
			result.pop();
		}
		result[result.length - 1].to = Number.MAX_VALUE;
		return result;
	}
}

Entity.init({Flow}, {
	name: { maxLength: 80 }
}, {
	ranges: false,
	experiments: { nullable: true, property: "flow" }
});