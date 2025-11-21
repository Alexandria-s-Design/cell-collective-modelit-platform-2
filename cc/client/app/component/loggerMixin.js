import Immutable, { Seq } from "immutable";
import Application from "../application";
import Add from "../action/add";
import Remove from "../action/remove";
import Update from "../action/update";
import UpdateProperty from "../action/updateProperty";
import Entity from "../entity/Entity";
import Model from "../entity/model";
import NetViz from "ccnetviz";
// import ClientConfig from "../../../config/.client.json";

export default (parent) => ( class extends parent {
	loggerSession(user) {
		this.ajax("_api/client/log", {
			screenWidth: screen.width,
			screenHeight: screen.height,
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight,
			platform: navigator.platform,
			appCodeName: navigator.appCodeName,
			appName: navigator.appName,
			appVersion: navigator.appVersion,
			vendor: navigator.vendor,
			referrer: document.referrer,
			webgl: NetViz.isWebGLSupported(),
			domain: Application.domain,
			domainRaw: Application.domainRaw,
			timeZoneOffset: new Date().getTimezoneOffset()
		}, null, null, user);
	}
	async loggerInit(name, record, f) {
		const o = record.model;
		const state = {};
		this.layoutSet(state.layout = record.state.layout);
		this.setState({ simulation: new Immutable.Map(record.state.simulation), curLayoutConf: Seq(record.state.curLayoutConf || {}).toMap() });

		if (isNaN(o)) {
			const map = {};
			Seq(Model.prototype.sources).forEach((e, k) => (e = o[k]) && (o[k + "Id"] = e.id));

			const model = this.modelCopyInternal(name, undefined, o, (t, s) => Seq(map[t] = Seq(o[t]).map((e, k) => (e = Seq(e).mapEntries(([k, v]) => (v && v.className ? [k + "Id", v.id] : [k, v])).toMap(),
			new Entity[t](e.set("id", s ? k : Entity.newId())))).toObject()), undefined, undefined, undefined, undefined, (k, s, t, f, c) => t.set(k, f(s[k], c)));
			model.logger = null;

			o.id < 0 ? f(map, state) : setTimeout(() => this.modelSave(f.bind(null, map, state)).then(() => {}), 0);
		}
		else {
			const e = this.Model[o];
			e.logger = null;
			this.modelSelect(true, e, () => f(Seq(this.entities).map((_, k) => Seq(e[k]).toObject()).toObject(), state));
		}
	}
	loggerAdd(group, action) {
		const state = this.state;
		const id = state.master;
		const model = this.modelGetSelectedDetail();
		if (model) {
			const convert = e => Seq(e.properties).filterNot((v, k) => (v && v.ref) || e[k] == null).map((_, k) => ((e.properties[k] || {}).toRaw || (e=>e) )(e[k],model)).concat(Seq(e.sources).filter((_, k) => e[k] && e[k].globalId).map((_, k) => e[k].globalId)).toObject();
			const copy = () => Seq(this.entities).filterNot(e => e.isPrivate).map((_, k) => Seq(model[k]).map(convert).toObject()).filter(e => Seq(e).size).concat({ id: id }, convert(model)).toObject();

			let logger = model.logger;
			logger === undefined ? (logger = model.logger = {
				time: Date.now(),
				state: {
					layout: state.layout,
					simulation: state.simulation.toObject(),
					curLayoutConf: state.curLayoutConf && state.curLayoutConf.toJS()
				},
				model: model.isPublic ? id : state.detail && copy(),
				actions: []
			}) : (logger && logger.model === undefined && state.detail !== undefined && (logger.model = copy()));

			if (logger) {
				const time = Date.now() - logger.time;
				let i = logger.actions.length;

                const ext = e => {
                    !e.group && (e.group = group);
                    e.id = -(++i);
                    e.time = time;
                    return e;
                };
                const a = logger.actions;
                (Array.isArray(action) || action.toSeq) ? Seq(action).forEach(e => e && e.toLog && a.push(ext(e.toLog(model)))) : a.push(ext(typeof action === "string" ? { action: action } : action));
            }
        }
    }
    loggerSend() {
        // Seq(this.Model).forEach(v=>Seq(v.all()).map(e => e.logger).filter(e => e && e.index !== e.actions.length).forEach(e => {
        //     this.ajax("_api/client/log", { logger: e.index ? { time: e.time, actions: e.actions.slice(e.index) } : e });
        //     e.index = e.actions.length;
        // }));
    }
    loggerExecute(map, state, actions, f) {
        const value = (a) => {
          const v = a.value !== undefined && a.value.className ? map[a.value.className][a.value.id] : a.value;
          const p = a.property && (Entity[a.entity.className].prototype.properties[a.property] || {});
          return p && p.fromRaw ? p.fromRaw(v) : v;
        }

        actions = actions.map(a => {
            const e = a.entity;

            switch (a.group) {
                case "Entity":
                    switch (a.action) {
                        case "add":     return new Add(map[e.className][e.id] = new Entity[e.className](this.entities[e.className].isShared ? this.convert(e.className, e.id, a.properties) : Seq(a.properties).map(value).toObject()), a.select);
                        case "remove":  return new Remove(map[e.className][e.id], a.selected !== undefined && map[e.className][a.selected]);
                        case "update":  return new Update(map[e.className][e.id], a.property, value(a));
                        case "select":
                        case "subSelect":
                          return this.entitySubSelect(e.id === undefined ? e.className : map[e.className][e.id], Seq(a.subEntity).map((v,k)=>Seq(v).map( v => map[k][v] ).valueSeq()).valueSeq().flatten(true).toArray());
                    }
                case "Model":
                    switch (a.action) {
                        case "update":      return new UpdateProperty(a.property, value(a));
                        case "save":        return this.modelSave(f).then(() => {});
                        case "layoutSave":  return this.modelLayoutSave(this.modelGetSelectedDetail(), f);
                    }
                case "State":       return this.stateSet(a.type || this.state, a.property.map(e => (e.className ? map[e.className][e.id] : e)), value(a));
                case "Simulation":  return e ? this.startExperiment(map[e.className][e.id]) : this.simulationRealtime[state.simulation = a.action]();
                case "Layout":
                    switch(a.action) {
                        case "changeWorkspace": return this.layoutChangeWorkspace(this.modelGetSelectedDetail(), Seq(a.ws).toMap(), f);
                        default:                return this.layoutSet(state.layout = a.name);
                    }
                case "History":     return this.historyMove(a.action);
            }
        }).filter(e => e);

		actions.length && this.entityUpdate(actions);
	}

	loggerStore(group, action, line=0, file='') {
			const bodyLogger = {
				level: 'INFO', message: '', action, group, file, line, user: null
			};
			if (group == 'WEB::MODEL') {
				const id = this.state.master;
				const { id: userId, email: userEmail, firstName: userName } = this.state.user;
				bodyLogger.user = {id: userId, email: userEmail, name: userName};
				bodyLogger.message = `Beginning to save model ${id}`;
				if (id <= 0) {
					bodyLogger.action = 'INSERT';
				}
			}
			// DISABLED:
			// fetch(`${import.meta.env.VITE_LOGGER_URL}/add/log`, {
			// 	method: 'POST',
			//  	headers: { 'Content-Type': 'application/json' },
			//  	body: JSON.stringify(bodyLogger)
			// })
			// .catch(error => console.error("It couldn't save logs: " + error.message, error));
	}

	UNSAFE_componentWillMount(...args) {
		super.UNSAFE_componentWillMount && super.UNSAFE_componentWillMount(...args);

		const log = (p, t, f) => {p.prototype.toLog = function(m) {
			const result = Seq(this).toObject();
			f(result, this.entity);
			result.action = t;
			result.entity && (result.entity = result.entity.globalId);
			return result;
		};};
		const value = (e, model) => (e.value = ((e.entity ? (e.entity.properties[e.property] || {}) : {}).toRaw || (e=>e))(e.value, model),e.value && e.value.globalId && (e.value = e.value.globalId));

		// log(Add, "add", (r, model) => {
		// 	const e = r.entity;
		// 	const values = Application.values[e.className];
		// 	const tr = (v, k) => (e.properties[k] && e.properties[k].toRaw ? e.properties[k].toRaw(v,model) : v);
		// 	r.properties = Seq(e.properties).filterNot((v, k) => e[k] === undefined || (values && (v = values[k]) && !v.to)).sortBy((v, k) => (k === "name" ? 0 : (v && v.ref ? 1 : 2)) + k).mapEntries(
		// 		([k, v]) => {
		// 			if(v && v.ref){
		// 				const nk = k.substring(0, k.length - 2);
		// 				return [nk, tr(e[k].globalId, k)];
		// 			}else{ return [k,tr(e[k], k)]; }
		// 		}
		// 	).toObject();
		// });
		// log(Remove, "remove", (e, model) => (e.selected ? e.selected = e.selected.id : delete e.selected));
		// log(Update, "update", (e, model) => value(e, model));
		// log(UpdateProperty, "update", (e, model) => (e.group = "Model", value(e, model)));
  }
  componentDidMount(...args) {
    super.componentDidMount && super.componentDidMount(...args);
    if (window.location.hostname !== "localhost") {
      this.loggerSession();
      setInterval(this.loggerSend.bind(this), 600*1000);
    }
  }
} );
