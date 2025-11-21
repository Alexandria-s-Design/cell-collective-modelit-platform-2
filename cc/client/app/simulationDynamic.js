import Immutable, { Seq } from "immutable";

export default class SimulationDynamic {
	constructor(model, experiment, immediate) {
		if (!SimulationDynamic.source) {
			SimulationDynamic.source = URL.createObjectURL(new Blob(["onmessage = " + (({data: e}) => new Function("o", "n", "f", e.source)(e.result, e.num, postMessage))], { type: "text/javascript" }));
			SimulationDynamic.id = 0;
			SimulationDynamic.pool = {};
			SimulationDynamic.numWorkers = Math.max(1, (navigator.hardwareConcurrency || 4) - 2);
		}

		const time = Date.now();
		this.model = model;
		this.data = { state: "RUNNING", percentComplete: 0, elapsedTime: 0 };

		const source = SimulationDynamic.genRawCode(model, experiment, immediate);
		const components = Seq(model.Component);
		const vr = experiment.validRanges.cacheResult();
        
		const input = {
			num: Math.ceil(experiment.numSimulations / SimulationDynamic.numWorkers),
			source: source.join("\n"),
			result: vr.map(() => components.map(e => []).toObject()).toObject()
		};

		let n = 0;
		const done = (w, e) => {
			const d = this.data;
			const o = e.data;
			if (o) {
				const push = Array.prototype.push;
				this.result ? Seq(this.result).forEach((v, e) => (e = o[e], Seq(v).forEach((v, k) => push.apply(v, e[k])))) : this.result = o;

				if (d.percentComplete === 1) {
					d.state = "COMPLETED";
					d.bitsAvailable = false;
					d.analysis = this.result;
				}
				SimulationDynamic.pool[w.id] = w;
			}
			else {
				d.percentComplete = ++n / experiment.numSimulations;
				d.elapsedTime = Math.round(0.001 * (Date.now() - time));
			}
		};

		for (let i = experiment.numSimulations; i; i -= input.num) {
			input.num = Math.min(input.num, i);
			let w = Seq(SimulationDynamic.pool).first();
			w ? delete SimulationDynamic.pool[w.id] : (w = new Worker(SimulationDynamic.source)).id = ++SimulationDynamic.id;
			w.onmessage = done.bind(this, w);
			w.postMessage(input);
		}
	}
    
	static genCode(model, experiment, immediate){
		return [];//.concat(expressions.map(e=>"\n"+e));
	}
    
	static genRawCode(model, experiment, immediate){
		const id = experiment.id;
		const map = model.Component;
		const components = Seq(map);
		const internal = components.filterNot(e => e.isExternal);
		const external = components.filter(e => e.isExternal).cacheResult();
		const g = e => (e < 0 ? "_" + (-e) : e);
		const f = (p, e) => ((p = p.interactions) && p[e.id] ? "h" : (e.isExternal ? "e" : "i")) + "[" + e.id + "]";
		const expressions = (immediate ? model.expressions(f) : new Immutable.Map(internal.map(e => e.expression(f.bind(null, e))))).map(e => e.replace(/[[\]]/g, "").replace(/-/g, "_"));
		const is = experiment.initialStateId;
		const async = experiment.type === "ASYNCHRONOUS";
		const vr = experiment.validRanges.cacheResult();
		const outputs = vr.mapEntries(([k, v]) => [g(k), v]).cacheResult();
		const runTime = outputs.maxBy(e => e.to).to;
		const flow = experiment.flow ? experiment.flow.build(e => (e.min != null ? (e.min !== 0 || e.max !== 100) && e : { min: e.value, max: e.value })).filter(e => e.from < runTime) :
			[{
				from: 0,
				to: runTime,
				mutations: Seq(experiment.mutations || {}).mapEntries(([_, e]) => [e.componentId || e.reactionId, e.state]).toObject(),
				activities: Seq(experiment.environment && experiment.environment.envExperimentActivities ? experiment.environment.envExperimentActivities : {}).mapEntries(([_, e]) => [e.componentId || e.reactionId, e]).toObject()
			}];

		flow.forEach((e, i) => e.index = i);
		const ranges = outputs.map(e => e.from).valueSeq().concat(outputs.map(e => e.to).valueSeq(), flow.map(e => e.from), flow.map(e => e.to).filter(e => e < runTime)).toMap().flip().map((_, k) => (
			{ from: k, env: Seq(flow).find(e => e.from <= k && e.to > k), outputs: outputs.filter(e => e.from <= k && e.to > k).keySeq().toArray() })).sortBy((_, k) => k).toArray();
		let p = {};
		ranges.forEach(e => (p.to = e.from, p = e));
		ranges.pop();

		const isActive = c => {
			let e = flow[0].mutations[id];
			return e ? e - 1 : (((e = c.initialStates) && e[is]) !== undefined) | 0;
		};

		const inner = (exp, a, b, outputs) => [
			external.map((v, k) => (k = g(k)) && ((v.interactionTargets ? "v" + k + "[j] = " : "") + "e" + k + " = Math.random() < r" + k +
                (outputs.length ? ("\ne" + k + " && (" + outputs.map(e => "s" + e + "_" + k + "++").join() + ")") : ""))).join("\n"),
			exp.map((v, k, e) => (e = map[k], k = g(k)) && ((outputs.length ? (b + k + " && (" + outputs.map(e => "s" + e + "_" + k + "++").join() + ")\n") : "") +
                (e.interactions ? Seq(e.interactions).map((v, k) => (k = g(k)) && ("h" + k + " = " + (v.threshold ? ("t(v" + k + ", j, " + (v.delay || 1) + ", " + v.threshold + ")") :
									("v" + k + "[Math.max(0, j-" + (v.delay - 1) + ")]")))).join("\n") + "\n" : "") +
                (e.interactionTargets ? "v" + k + "[j] = " : "") + a + k + " = " + (async ? ("Math.random() < 0.5 ? " + b + k + " : ") : "") + v.replace(/c/g, a).replace(/i/g, b))).join("\n")
		].join("\n");

		const loop = (a, b, c) => {
			const env = c.env;
			const mutations = env.mutations;
			const exp = expressions.map((v, k) => 
				((k = mutations[k]) ? (k === 2).toString() : v || "0")
			);
			const ei = env.index;

			return ([
				env.from === c.from && external.map((_, k) => "r" + g(k) + " = m" + ei + "[" + k + "];").join("\n"),
				"for (var j = " + c.from + "; j < " + c.to + "; j++) {",
				inner(exp, a, b, c.outputs),
				(c.to - c.from) % 2 ? (bl = loop.bind(null, b, a), "if (++j === " + c.to + ") break") : "j++",
				inner(exp, b, a, c.outputs),
				"}"
			]).filter(e => e).join("\n");
		};

		let bl = loop.bind(null, "a", "b");

		return [
			"eval('')",
			"function t(a, i, d, t) { var s = t < 0; var e = Math.max(0, i - d); for (var j = Math.max(0, e - Math.abs(t)); j < e; j++) { if (a[j] === s) return s; } return !s; }",
			flow.map(e => "var m" + e.index + " = {}").join("\n"),
			external.map((_, k) => (k = g(k)) && ("var r" + k + ", e" + k)).join("\n"),
			internal.map((_, k) => (k = g(k)) && ("var a" + k + ", b" + k)).join("\n"),
			components.filter(e => e.interactionTargets).map((_, k) => (k = g(k)) && ("var h" + k + ", v" + k + " = []")).join("\n"),
			outputs.map((_, i) => components.map((_, k) => "var s" + i + "_" + g(k)).join("\n")).join("\n"),
			"var p",
			"for (var i = 0; i < n; i++) {",
			flow.map(e => external.map((_, k) => "m" + e.index + "[" + k + "] = " + (k = ((k = e.activities[k]) ? { min: 0.01 * k.min, max: 0.01 * k.max } : { min: 0, max: 1 }), k.min + " + " + (k.max - k.min) + "*Math.random()")).join("\n")).join("\n"),
			internal.map((v, k) => (v.interactionTargets ? "v" + g(k) + "[0] = " : "") + "b" + g(k) + " = " + isActive(v)).join("\n"),
			outputs.map((_, i) => components.map((_, k) => "s" + i + "_" + g(k) + " = 0").join("\n")).join("\n"),
			ranges.map(e => bl(e)).join("\n"),
			vr.map((v, i) => (v = "/" + 0.01 * (v.to - v.from), "p = o[" + i + "]\n" + components.map((_, k) => "p[" + k + "].push(s" + g(i) + "_" + g(k) + v + ")").join("\n"))).join("\n"),
			"f(null)",
			"}",
			"f(o)"
		];
	}
}