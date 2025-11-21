import { Seq, Map } from "immutable";
import Application from "../application";
import ContextSpecificiMAT from "../containers/InitialStates/ContextSpecificiMAT";
import ContextSpecificGIMME from "../containers/InitialStates/ContextSpecificGIMME";
import ContextSpecificFastCore from "../containers/InitialStates/ContextSpecificFastCore";
import AnalysisDrugIdentification from "../containers/InitialStates/AnalysisDrugIdentification";

export default (parent) => ( class extends parent {
    modelStateInit(model) {
			const _getExperiment = eType =>
				Seq(model.Experiment)
					.filter(e => e.experimentType === eType)
					.map(e => new Map({ state: e.state }))
					.toMap()

        return new Map({
					simulation: new Map({
						step: 0,
						stepSize: 0.1,
						endTime: 100,
						subjectCount: 100,
						visibility: new Map(),
						activity: new Map(),
						mutation: new Map(),
						compartmentCheckbox: new Map(),
						data: new Map()
					}),
					Metabolic: new Map({
						styles: new Map()
					}),
					Metabolite: new Map({
						visibility: new Map()
					}),
					Reaction: new Map({
						visibility: new Map()
					}),
					Experiment: new Map({
							"": Seq(model.Experiment)
								.filter(e => e.state === "RUNNING")
								.map(e => new Map({ state: e.state }))
								.toMap(),
							"EnvironmentSensitivity": new Map(),
							"fba": _getExperiment("fba"),
							"fva": _getExperiment("fva")
					}),
					KineticLaw: [],
					BooleanAnalysis: new Map({}),
					selected: new Map({
						InitialState: model.initialStateId,
						Layout: model.layout ? model.layout.id : undefined
					}),
					subSelected: new Map(),
					selection: Seq(this.entities).map(e => new Map()).toMap(),
					isPublic: model.isPublic,
					selectedEntity: undefined,
					contextSpecificiMAT: ContextSpecificiMAT(model),
					contextSpecificGIMME: ContextSpecificGIMME(model),
					contextSpecificFastCore: ContextSpecificFastCore(model),
					analysisDrugIdentification: AnalysisDrugIdentification(model),
					ComponentExternalActivity: new Map(),
        });
    }
    stateGetKey(s){
        if(isNaN(s) && !Array.isArray(s))
          {return ((s && s.uniqk) ? (s.uniqk ) : ( (s.detail || s)+"" ));}
        return s;
    }
    stateSetInternal(s, p, v, origstate = this.state) {
        const state = {};
        state[this.stateGetKey(s) || s] = origstate[this.stateGetKey(s) || s].setIn(p.map(e => (e.id !== undefined ? e.id : e)), v && (v.id !== undefined ? v.id : v));
				this.setState(state);
        return state;
    }
    stateSet(s, p, v, origstate) {
        const log = { action: "update", property: p.map(e => e.globalId || e), value: (v && v.globalId) || v };
        isNaN(s) && (log.type = {detail: s.detail});
				this.loggerAdd("State", log);
        return this.stateSetInternal(s, p, v, origstate || this.state);
    }
    stateMerge(s, p, v) {
        const state = {};
        state[this.stateGetKey(s) || s] = this.state[this.stateGetKey(s) || s].mergeIn(p, v);
        this.setState(state);
    }
    stateGetPersistentStorage(st, k){
        return st["VERSION["+Application.version+"]"+k];
    }
    stateSetPersistentStorage(st, k, v){
        return st["VERSION["+Application.version+"]"+k] = v;
    }
    stateDeletePersistentStorage(st, k){
        let v = Application.version;
        do{ st["VERSION["+Application.version+"]"+k] && (delete st["VERSION["+Application.version+"]"+k]); }while(--v);
    }
    stateCopyPersistentStorage(st, fr, to){
        let v = Application.version;
        do{ st["VERSION["+Application.version+"]"+fr] && (st["VERSION["+Application.version+"]"+to] = st["VERSION["+Application.version+"]"+fr]); }while(--v);
    }
} );
