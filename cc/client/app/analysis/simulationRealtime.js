import Immutable, { Seq } from 'immutable';
import Add from '../action/add';
import Flow from '../entity/flow';
import FlowRange from '../entity/flowRange';
import FlowMutation from '../entity/flowMutation';
import FlowActivity from '../entity/FlowActivity';

export default class {
    constructor(getState, getModelState, getModel, getReference, onStart, update, batch, log) {
        this.getState = getState;
        this.getModelState = getModelState;
        this.getModel = getModel;
        this.getReference = getReference;
        this.onStart = onStart;
//        this.update = e => update(this, ["simulation", "step"], e);
        this.update = function(e){ return update(getModel().path, ["simulation", "step"], e); };
        this.batch = batch;
        this.log = log;
        this.step = 0;
    }

    build(model) {
        const f = (p, e) => ((p = p.interactions) && (p = p[e.id]) ? ("h(" + e.id + "," + ((p.delay || 1) - 1) + "," + p.threshold + ")") : ((e.isExternal ? "e" : "i") + "[" + e.id + "]"));
        this.expressions = (this.immediate ? model.expressions(f) : new Immutable.Map(Seq(model.Component).filterNot(e => e.isExternal).map(e => e.expression(f.bind(null, e))))).
            map(e => new Function("e", "i", "c", "h", "return " + e));
    }

    initFlow(flow) {
        const e = flow.build(e => (e.value != null ? e.value : (e.min + e.max) / 2));
        e.forEach(e => (e.mutations = new Immutable.Map(e.mutations), e.activities = new Immutable.Map(e.activities)));

        return {
            id: flow.id,
            self: e,
            current: Seq(e).findLast(e => e.from <= this.step)
        };
    }

    init() {
        this.step = 0;
        const model = this.getModel();
        const reference = this.getReference();
        if (this.reference !== reference) {
            this.build(model);
            this.id = model.id;
            this.reference = reference;
            const f = this.getModelState().getIn(["selected", "Flow"]);
            this.flow = f != undefined ? this.initFlow(model.Flow[f]) : undefined;

        }
        else if (this.flow) {
            this.flow.current = this.flow.self[0];
        }

        const components = Seq(model.Component);
        this.state = components.map((_, k) => ({ b: 0, input: [], values: [], avg: [], sum: 0, name: model.Component[k].name })).toObject();
        this.external = components.filter(e => e.isExternal).toMap();
        this.window = this.getState().get("window");
        this.windows = [];
        this.update(0);
    }

    reset() {
        clearTimeout(this.runner);
        this.state = this.windows = undefined;
        this.step && (this.step = 0, this.getModelState() && this.update(0));
        this.id = this.reference = undefined;
    }

    run() {
        let delay, model = this.getModel();

        if (this.id !== model.id) {
            this.init();
            delay = 0;
        }
        else {
            const global = this.getState();
            const local = this.getModelState();

            const se = local.getIn(["selected", "SimulationEnvironment"]);
            const sa = se ? Seq(model.SimulationActivity) : Seq();


            const envActivities = {};
            sa.forEach(a => {
                if(a.parentId == se){envActivities[parseInt(a.componentId, 10)] = a.value}
            });


            const ss = local.get("simulation");
            const mutation = ss.get("mutation");
            let env = { mutations: mutation.filter(e => e), activities: Immutable.Map(envActivities) /*ss.get("activity")*/};
            const is = local.getIn(["selected", "InitialState"]);
            const sf = local.getIn(["selected", "Flow"]);
            const reference = this.getReference();

            const isActive = c => {
                let e = env.mutations.get(c.id);
                return e ? e - 1 : (((e = c.initialStates) && e[is]) !== undefined) | 0;
            };

            if (this.recording) {
                const e = this.recording.current;
                (e.activity !== env.activities || e.mutation !== mutation) && this.addRecord(ss);
            }

            if (this.reference !== reference) {
                const f = (_, k) => {
                    const s = this.state[k];
                    if (s && s.values[this.step - 1] === undefined) {
                        s.b = this.step;
                        s.sum = 0;
                    }
                    return !s;
                };
                this.build(model);
                sf !== undefined && (env = (this.flow = this.initFlow(model.Flow[sf])).current);
                this.reference = reference;
                const components = Seq(model.Component);
                this.state = components.filter(f).map((_, k) => ({ b: this.step, input: [], values: [], avg: [], sum: 0, name: model.Component[k].name })).concat(this.state).toObject();
                this.external = components.filter(e => e.isExternal).toMap();
                this.internal = components.filterNot(e => e.isExternal).map((v, k) => ((this.internal !== undefined) ? this.internal[k] : isActive(v))).toObject();
            }
            sf != undefined ? env = (this.flow && this.flow.id === sf ? this.flow : this.flow = this.initFlow(model.Flow[sf])).current : this.flow = undefined;
            !this.step && (this.internal = Seq(model.Component).filterNot(e => e.isExternal).map(e => isActive(e)).toObject());

            if (this.window !== global.get("window")) {
                const j = this.step;
                const b = j - (this.window = global.get("window"));
                Seq(this.state).forEach(e => {
                    const values = e.values;
                    let sum = 0;
                    for (let i = Math.max(e.b, b); i < j; i++) sum += values[i];
                    e.sum = sum;
                });
            }

            const state = this.state;
            const w = this.window;
            const async = global.get("type") === "ASYNCHRONOUS";
            const speed = global.get("speed");
            const n = Math.max(1, speed + 1);

            for (let i = 0; i < n; i++) {
                const j = this.step++;
                this.windows.push(w);

                const add = (e, i, v) => {
                    e.input[j] = i;
                    e.values[j] = v;
                    e.avg[j] = j >= e.b + w ? (e.sum += (v - e.values[j - w])) / w : (e.sum += v) / (j - e.b + 1);
                };

                const history = (k, d, t) => {
                    const s = state[k].values;
                    let b, e = Math.max(0, j - d);
                    return t ? (b = Math.max(0, e - Math.abs(t)), Seq(s).skip(b).take(e - b + 1)[t > 0 ? "every" : "some"](e => e)) : s[e];
                };

                const external = this.external.map((_, k) => Math.random() < 0.01 * env.activities.get(k, 0)).toObject();
                const mutations = env.mutations;
                Seq(this.internal).forEach((v, k) => add(state[k], 100*(mutations.get(k, 0) - 1), v));
                Seq(external).forEach((v, k) => add(state[k], env.activities.get(k, 0), v));
                const prev = this.internal;
                const current = {};
                this.internal = this.expressions.map((f, k) => current[k] = async && Math.random() < 0.5 ? prev[k] : (mutations.has(k) ? mutations.get(k) - 1 : f(external, prev, current, history))).toObject();
                this.flow && j === this.flow.current.to && (this.flow.current = env = Seq(this.flow.self).find(e => e.from === j));
            }
            this.update(this.step);
            delay = 100*Math.max(1, 1 - speed);
        }
        this.runner = setTimeout(this.run.bind(this), delay);
    }

    start(immediate) {
        this.log("Simulation", "start");
        this.onStart();
        if (this.immediate !== immediate) {
            this.immediate = immediate;
            this.reference = undefined;
        }

        this.runner = setTimeout(this.run.bind(this), 0);
    }

    stop() {
        this.log("Simulation", "stop");
        clearTimeout(this.runner);
    }

    addRecord(state) {
        this.recording.states[this.step] = this.recording.current = {
            activity: state.get("activity"),
            mutation: state.get("mutation")
        };
    }

    recStart() {
        this.log("Simulation", "recStart");
        this.recording = { states: {} };
        this.addRecord(this.getModelState().get("simulation"));
    }

    recStop() {
        this.log("Simulation", "recStop");

        let range, ranges = Seq(this.recording.states).map((v, k) => (range && (range.to = k), range = { from: k, value: v })).toArray();
        const flow = new Flow({ name: "Recording (" + (range.to = this.step) + "/" + ranges.length + ")" });
        const batch = [];
        const map = this.getModel().Component;
        const add = (s, t, p) => s.filter(e => e).forEach((v, e) => batch.push(new t((e = { parent: range, component: map[e] }, e[p] = v, e))));

        ranges.forEach(e => {
            batch.push(range = new FlowRange({ parent: flow, name: "Range (" + e.from + "-" + e.to + ")", from: +e.from, to: +e.to }));
            add(e.value.mutation, FlowMutation, "state");
            add(e.value.activity, FlowActivity, "value");
        });
        this.batch([new Add(flow, true)].concat(batch.map(e => new Add(e))));
        this.recording = null;
    }
}
