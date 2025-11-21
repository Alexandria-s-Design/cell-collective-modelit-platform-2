import Immutable, { Seq } from "immutable";
import Utils from "../utils";
import Add from "../action/add";
import Remove from "../action/remove";
import Update from "../action/update";
import Component from "../entity/Component";
import Gene from "../entity/metabolic/Gene";
import Regulator from "../entity/Regulator";
import LayoutComponent from "../entity/layoutComponent";
import Experiment from "../entity/Experiment";
import DrugScore from "../entity/DrugScore";

export default (parent) => (class extends parent{
	UNSAFE_componentWillMount(...args) {
		super.UNSAFE_componentWillMount && super.UNSAFE_componentWillMount(...args);
		this.hover = Utils.debounce(() => this.setState({ hover: this.hovered }), 20);
	}
	entitySubSelect(e, es){
		const los = {};
		const os = {};
		es.forEach(e => {((os[e.className] || (os[e.className] = {}))[e.id] = true); (los[e.className] || (los[e.className] = [])).push(e.id);});
        this.loggerAdd("Entity", { action: es.length ? "subSelect" : "select", entity: e.globalId || { className: e }, subEntity: los });
        const detail = this.state[this.stateGetKey(this.state)];
        const state = { hover: null };

        const o = {};
        const f = e => o[e.className || e] = e.id;
        f(e);
				e.select && e.select().filter(e => e).forEach(f);
				state[this.stateGetKey(this.state)] = detail.setIn(["selectedEntity"], e.className || e)
					.mergeIn(["selected"], o)
					.setIn(["subSelected"],Seq(os));

        this.setState(state);

        if (e instanceof Experiment && e.state === "COMPLETED") {
						if (e.experType == 'DRUG' && e.drugSimulation) {
							// this.ajax(`api/model/analyze/scores/${e.drugSimulation.dirdata}`, null, resData => {
							// 	if (resData.data) {
							// 		resData.data.scores.forEach(scoVal => {
							// 			this.entityUpdate([new Remove(new DrugScore(scoVal), true), new Add(new DrugScore(scoVal), true)]);
							// 		});
							// 	}
							// })
						} else {
            const a = s => s[this.stateGetKey(this.state)].hasIn(["Experiment", "", e.id, "analysis"]);
            !a(state) && this.ajax("_api/simulate/get/" + e.id + "?" + e.lastRun.getTime(), null, data => !a(this.state) && this.stateMerge(this.state, ["Experiment", "", e.id], new Immutable.Map({ state: "COMPLETED", analysis: data, bitsAvailable: e.bitsAvailable })));
						}
        }
    }
    entitySelect(e) {
			this.entitySubSelect(e, []);
		}
    entityHover(e, property) {
        this.hovered = e && { entity: e, property: property };
        this.hover();
    }
    entityDrag(f, e, x, y) {
        this.setState({
            dragging: { entity: e, helper: f(e), x: x, y: y },
            hover: null
        });

        Utils.drag(e => {
						if (!this.draggingRef) { return }
            const s = this.draggingRef.current.style;
            s.left = e.clientX + "px";
            s.top = e.clientY + "px";
        }, () => this.setState({ dragging: null }));
    }
    entityUpdate(changes, after, curState = this.state, silent = false, detail = undefined) {
				!silent && this.loggerAdd("Entity", changes);

        this.setState((curState) => {
            detail = detail || curState.detail;
            const id = detail[0];
						const model = this.modelGetPath(detail);
						const modelType = model.modelType;
						const speciesType = modelType == "boolean" ? "component" : "gene" 
            const key = this.stateGetKey(curState);
            const state = {
                entities: curState.Model.get(model.path[0]),
                selected: curState[key] && curState[key].get("selected")
            };
            const prevEntities = curState.Model.get(model.path[0]);

            let dirty;
            changes.forEach(e => dirty = (e && e.apply(state, model, this.entities)) || dirty);

            if (dirty) {
                this.historyPush(curState, detail);
                const ePath = model.path.slice(1); //substract modelId

                const layout = () => {
                    const f = e => e.map(e => new Update(e, "x", undefined)).concat(e.map(e => new Update(e, "y", undefined)));
                    const getDim = (e, p) => {
                      const r = Seq(e.reduce((d, e) => ({ minX: Math.min(e.x, d.minX), maxX: Math.max(e.x, d.maxX), minY: Math.min(e.y, d.minY), maxY: Math.max(e.y, d.maxY) }), p)).toObject();
                      if(r.maxX < r.minX + 0.01) r.maxX += 0.1;
                      if(r.maxY < r.minY + 0.01) r.maxY += 0.1;
                      return r;
                    }

                    const orignodes = Seq(model.nodes.map(e=>({x:e.x,y:e.y})).toObject());
                    const ext = (e, p) => Seq(getDim(e, p)).forEach((v, k) => new Update(p, k, v).apply(state, model, this.entities));

                    let a = Seq(changes).filter(e => e instanceof Add).map(e => e.entity);
										const nc = a.filter(e => (e instanceof Component || e instanceof Gene)).cacheResult();
										const u = a.map(e => (e instanceof Regulator ? [e[speciesType], e.source] : (e.className.indexOf("ConditionSpecies") >= 0 ? [e[speciesType]] : null)))
												.filter(e => e)
												.map(e => Seq(e))
												.flatten(true)
												.filter(e => e)
												.filter(e => /*Seq(e.upStreams).size + Seq(e.downStreams).size +*/ Seq(e.conditions).size + Seq(e.subConditions).size === 1)
												.cacheResult();
												
                    const d = Seq(model.Layout);
                    const olc = Seq(d).map(e=>Seq(e[`${speciesType}s`]).map(e=>({x:e.x, y: e.y})).toMap().toSeq()).toMap().toSeq();
                    a = d.size ? f(u).concat(d.map(p => nc.map(e => new Add(new LayoutComponent({ parent: p, [speciesType]: e })))).flatten(true), f(d.map(e => e[`${speciesType}s`]).map(m => u.map(e => m[e.id])).flatten(true))) : f(u);
                    a.cacheResult().forEach(e => e.apply(state, model, this.entities));

                    if (a.size + nc.size) {
                        const edges = model.edges.cacheResult();
                        const origDim = getDim(orignodes.filter(e => e.x !== undefined), {minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity});
                        state.entities = state.entities.setIn(ePath, this.modelLayout("Component", state.entities.getIn(ePath), model, model.nodes.map((v, k) => ({ id: k, x: v.x, y: v.y })), edges));
                        d.forEach(le => {
                            const map = le[`${speciesType}s`];
                            const layoutDim = getDim(Seq(map).filter(e => e.x !== undefined), le);

                            layoutDim.minX = layoutDim.minX || 0;
                            layoutDim.minY = layoutDim.minY || 0;
                            layoutDim.maxX = isNaN(layoutDim.maxX) ? 1 : layoutDim.maxX;
                            layoutDim.maxY = isNaN(layoutDim.maxY) ? 1 : layoutDim.maxY;
                            const ch = {};
                            state.entities = state.entities.setIn(ePath, this.modelLayout("LayoutComponent", state.entities.getIn(ePath), model, model.nodes.map((_, k) => {
															const e = map?.[k];
															return { id: e?.id, x: e?.x, y: e?.y, cid: e?.[`${speciesType}Id`] };
														}), edges, (nodes)=>{
                                Seq(nodes, edges).forEach((e) => {
                                        let n;
                                        if(!e.fixed){
                                        if((n = olc.getIn([le.id, e.cid])) && n.x !== undefined){
                                            e.x = n.x; e.y = n.y;
                                        }else if((n = orignodes.get(e.cid)) && n.x !== undefined){
                                            e.x = (n.x - origDim.minX) * (layoutDim.maxX - layoutDim.minX) / (origDim.maxX - origDim.minX) + layoutDim.minX;
                                            e.y = (n.y - origDim.minY) * (layoutDim.maxY - layoutDim.minY) / (origDim.maxY - origDim.minY) + layoutDim.minY;

                                        }
                                        ch[e.cid] = true;
                                        e.x !== undefined && (e.fixed = true, e.store = true);
                                    }

                                });
                            }, le));
                            ext(Seq(map).filter(e => ch[e[speciesType].id]), le);
                        });
                    }
                    else {
                        Seq(changes).filter(e => e && !(e instanceof Remove)).map(e => e.entity).filter(e => e instanceof LayoutComponent).groupBy(e => e.parent).forEach(ext);
                    }
                    return state.entities.getIn(ePath);
								};
								
                const o = {};
                o[key] = curState[key];
                (!detail || detail == curState.detail) && state.selected && (o[key] = o[key].set("selected", state.selected));
                Seq(changes).some(e => !(e instanceof Update)) && (o.hover = null);
                this.Model[id].set(state.entities);
                model.set(layout());
                o.Model = curState.Model.set(id, this.Model[id].self);
                (!detail || (detail+"" == curState.detail+"")) && (o.entities = this.Model[id].self);
                return o;
            }
            return {};
        }, after);
    }
} );
