import Immutable, { isCollection, Seq, Range } from 'immutable';
import Utils from '../utils';
import ForceLayout from 'ccnetviz/src/layout/force';
import Application from '../application';
import History from '../history';
import Message from './dialog/message';
import Confirmation from './dialog/confirmation';
import Update from '../action/update';
import Entity, {Entities} from '../entity/Entity';
import Model from '../entity/model';
import ModelEntity from '../entity/modelEntity';
import ModelVersion from '../entity/ModelVersion';
import {source} from "../../app/layouts";


import EventEmitter from  'wolfy87-eventemitter';


import cc, {ModelType} from '../cc';
import { APP_MODEL_CATEGORIES, APP_RESTART_LESSON, APP_START_LESSON } from '../util/constants';
import Annotation from '../entity/metabolic/Annotation';

// Import all entitites on EntitiesLoader for application to see where the entities are
import errorResponse from '../util/errorResponse';
import { isEditEnabled } from '../util/permissionsUtil';

export const ModelEvents = new EventEmitter();

function filterForceUpdate(propsMap = [], tMap) {
	return (curProp) => Boolean(propsMap.filter(p => (p[0] == tMap && p[1].includes(curProp)) ).length);
}

function waitForPing(ajax, intervalMs = 5000, timeoutMs = 6 * 60 * 1000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const intervalId = setInterval(async () => {
      const elapsed = Date.now() - start;
      if (elapsed >= timeoutMs) {
        clearInterval(intervalId);
        console.log('Exporting SBML timeout reached, ping not true');
        return resolve(false);
      }
      try {
        const res = await ajax();
        if (res.data && res.data.ping === true) {
					console.log('Exporting SBML timeout ping is true');
          clearInterval(intervalId);
          return resolve(true);
        }
      } catch (err) {
        console.log('Exporting SBML request failed:', err.message);
				clearInterval(intervalId);
      }
    }, intervalMs);
  });
}

export function assignEntityProperties(model, entities, persisted) {
	const getE = (self, seqV, seqK) => {
			let e;
			if (((seqV || {}).source || {}).isSelf) {
					const c = {}; c[self.id] = self;
					e = Seq(c);
			} else {
					e = entities.get(seqK).map(e => {
							//Prototype requires files loaded from ModelVersion
							const d = Seq(e).map( (v,k2) => (( (k2 = Entity[seqK].prototype.properties[k2]) && (k2 = k2.fromRaw)) ? k2(v, model) : v) ).toMap();
							+d.get('id') && Entity.allocNewId(+d.get('id'));
							const _entity = new Entity[seqK](d);
							// if (seqK == 'Metabolite') {
							// 	_entity['formula'] = d.get('formula');
							// 	_entity['speciesId'] = d.get('speciesId');
							// }
							return _entity;
					});
			}
			return e;
	}
	return (seqV, seqK) => {
		const e = getE(model, seqV, seqK);
		model["_" + seqK] = e.toObject();
		model[seqK] = e.toObject();
		persisted && (persisted[seqK] = getE(persisted, seqV, seqK).toObject());
	}
}

export default (parent) => ( class extends parent{
	  componentDidMount(...args) {
    this.props.updateSavingStatus(this.state.saving);
		super.componentDidMount && super.componentDidMount(...args);
	}

	shouldComponentUpdate(nextProps, nextState){
		if(nextState.saving !== this.state.saving){
      this.props.updateSavingStatus(nextState.saving);
		}
		if(nextProps.modelSearch && this.props.modelSearch !== nextProps.modelSearch){
			this.modelSearch(nextProps.modelSearch);
		}
		return super.shouldComponentUpdate ? super.shouldComponentUpdate(nextProps, nextState) : true;
	}

	modelLayout(type, entities, model, nodes, edges, customLayout, dimensions) {
			nodes = nodes.toObject();
			edges = edges.map(e => ({ source: nodes[e.source], target: nodes[e.target.id] })).toArray();

			let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, fixedCnt = 0;
			(nodes = Seq(nodes).sortBy((_, k) => -k).toArray()).forEach((e, i) => {
					e.index = i;
					e.fixed = e.x !== undefined;
					if(e.fixed){
						minX = Math.min(minX, e.x);
						minY = Math.min(minY, e.y);
						maxX = Math.max(maxX, e.x)
						maxY = Math.max(maxY, e.y)
						fixedCnt++;
					}
			});

			const loptions = (dimensions && dimensions.minX !== undefined ? dimensions : (fixedCnt >= 2 ? {minX, maxX, minY, maxY} : undefined))  || {};
			customLayout && customLayout(nodes, edges, loptions);
//        myLayout(nodes, edges);
        new ForceLayout(nodes, edges, loptions).apply();
				return entities.set(type,
					entities.get(type).withMutations(m =>
						nodes
							.filter(e => e && e.id && (!e.fixed || e.store))
							.forEach(e => {
								const id = e.id;
								const modelItem = model[type]?.[id];
								const existing = m.get(id);
								if (modelItem && existing) {
									const merged = existing.merge(Seq([["x", e.x], ["y", e.y]]));
									m.set(id, modelItem.set(merged).self);
								}
							})
					)
				);
		}

		getUser(u){
			const user = u && {...u, name: ((u.firstName|| "") + " " + (u.lastName || "")).trim() || u.email || "" , workspace: this.Workspace};
			return user
		}

		getModelTypeClass (modelType) {
			return ModelType[modelType].entityClass();
		}

		modelList() {
		}

		async modelLoad(modelData, mOptions) {
			const patchMetabolicModelAPI = m => {
				const user = this.state.user || { };

				m.modelType = m.modelType || m?.model?.modelType;

				if ( !["boolean", null, undefined].includes(m.modelType) ) {
					const currentVersion = m.versions.find(v => v.id == m.defaultVersion);

					m.model = {
						id: m.id,
						name: m.name,
						type: m.domainType,
						userId: m._createdBy,
						published: m.public,
						currentVersion: currentVersion && currentVersion.version,
						nMetabolites: currentVersion ? currentVersion.n_metabolites : 0,
						nReactions: currentVersion ? currentVersion.n_reactions : 0,
						created: m._createdAt,
						biologicUpdateDate: m._updatedAt,
						knowledgeBaseUpdateDate: m._updatedAt,
						modelVersionMap: Seq(m.versions).reduce((prev, next) => {
							next = {
								[next.version]: {
									userId: next._createdBy,
									selected: m.defaultVersion == next.id
								}
							}

							return { ...prev, ...next }
						}, { })
					}

					m.modelPermissions = {
						view: 		true,
						edit: 		m._createdBy == user.app_user_id,
						delete: 	m._createdBy == user.app_user_id,
						share:		m._createdBy == user.app_user_id,
						publish: 	m._createdBy == user.app_user_id
					}

					m.metadataValueMap = {

					}

					m.metadataRangeMap = {
					}
				}
				return m;
			};

			const data = modelData.map(md => patchMetabolicModelAPI(md));

			this.User = this.User || {};
			const missingUsers= Seq(data.map(e => e.model.userId)).filterNot(e => this.User[e]).cacheResult();
			if(!missingUsers.isEmpty()){
				const u = await this.ajaxPromise("_api/user/lookupUsers?"+missingUsers.toSet().filter(e => e).map(e => "id=" + e).join("&"));
				this.User = Seq(this.User).concat(u).toObject();
			}

				const getE = m => Seq(m.model).mapEntries(([k, v]) => [Application.properties.ModelVersion.from[k] || k, v]).toObject();

				const globalEntities = Seq(this.entities).filter(e=>e.global).cacheResult();

				const reduxData = { };

				const curModel = this.state.Model ? new Immutable.Map(this.state.Model) : new Immutable.Map();
				const curLayouts = this.state.Layouts ? new Immutable.Map(this.state.Layouts) : new Immutable.Map();

				const newModel = curModel.merge(new Immutable.Map(data.map(mp => {
						const e = getE(mp);
						const id = e.id = e.id.toString();

						if (mp.requestedId) {
							this.BaseIdMap[mp.requestedId] = mp.model.id;
						}

						if(curModel.has(id))
							{return [id, curModel.get(id)];}

						e.pendingVersionId = "";
						e.currentVersion = e.currentVersion +"";
						e.hash = mp.hash;
						e.modelType = mp.modelType;
						e.created = new Date(e.created);
						e.updated = new Date(Math.max(new Date(e.biologicUpdateDate).getTime(), new Date(e.knowledgeBaseUpdateDate).getTime()));
						const modelE = new Immutable.Map({
							currentVersion: e.currentVersion + "",
							originId: e.originId,
							id: id,
							type: e.type,
							modelType: e.modelType,
							userId: e.userId,
							name: e.name,
							description: e.description
						});
						const m = this.Model[id] = new Model(modelE);
						this.Persisted[id] = new Model(modelE);
						m.user = this.User[e.userId];
						m.permissions = mp.modelPermissions;
						m.isPublic = e.published;
						m.coverImage = mp.coverImage;
						m.versionValues = [];
						m.getVersion = undefined;
						if (m.modelType == 'metabolic') {
							m.getVersion = e.currentVersion;
						}
						if ( m.coverImage && m.coverImage.endsWith(".webp") ) { // is a url
							const url = `/api/model/cache/${m.coverImage}`;
							cc.request.get(url);
						}

						if (mOptions && mOptions.hasOwnProperty('courseId')) {
							m.courseId = mOptions.courseId;
						}

						m.created = e.created;
						m.updated = e.updated;

						const models = {};
						const pmodels = {};
						let selected;
						const r = Seq(e.modelVersionMap).map((v, version) => {
								m.versionValues.push(v.version);
								version = cc._.cstr(version);
								const map = (new Immutable.Map(e)).withMutations(mv=>{
									mv.delete("workspaceLayout");
									mv.set('id', version);
									mv.set('name', v.name || version);
									mv.set('description', v.description);
								});
								const ModelClass = this.getModelTypeClass(m.modelType);

								const model  = models[version] = new ModelClass(map);
								const pmodel = pmodels[version] = new ModelClass(map);
								this.Model[id].add(model);
								this.Persisted[id].add(pmodel);

								v.selected && (selected = model);

								pmodel.numNodes = model.numNodes = e.components;
								pmodel.numEdges = model.numEdges = e.interactions;

								if( m.modelType === 'metabolic' ) {
									pmodel.nMetabolites = model.nMetabolites = mp.model.nMetabolites;
									pmodel.nReactions   = model.nReactions   = mp.model.nReactions;
								}

								//load entities
								Seq(Application.entities).filter(e => e.isPublic).forEach((v, t) => model[t] = Seq(mp[v.source]).map((v, k) => new Entity[t](this.convert(t, k, v))).toObject());
								const d = this.MetadataDefinition;
								mp.metadataValueMap = mp.metadataValueMap || {};
								mp.metadataRangeMap = mp.metadataRangeMap || {};
								Seq(mp.metadataValueMap).concat(mp.metadataRangeMap).groupBy(e => e.definitionId).forEach((v, t) => (t = d[t]) && (model[t.className] = v.map((v, k) => new t(this.convert(t.className, k, v))).toObject()));

								return model.self;
						}).toObject();

						selected && (r.selected = selected);
						const entities = this._modelGetEntitiesDef(globalEntities, mp, this.Model[id], Seq());
						this._modelAddEntities(globalEntities, entities, this.Model[id], this.Persisted[id]);

						const map = new Immutable.Map(r).merge(Seq(entities)).merge(m.self);

						reduxData[id] = true;

						this.Model[id].self = this.Persisted[id].self = map;
						return [id, map];
				}).filter(e=>e)));

				// const state = Seq(this.layoutGetInitState(e)).concat({ Model: newModel }).toObject();
				const state  = { Model: newModel }
				state.Layouts = curLayouts.merge(new Immutable.Map(data.map(mp=>{
						const e = getE(mp);
						const id = e.id = e.id.toString();
						return [id, Seq(e.modelVersionMap).map((_, version) => (this.Persisted[id].sub(version+"").workspaceLayout = new Immutable.Map(e.workspaceLayout))).toMap()];
				})));

				Seq(this.Model).filter(e => !e.builded   /*modelData.some(md => (md.id || md?.model?.id) == e.top.id)*/).forEach( m => {
						Seq(m.all()).forEach(version => {
							version.build(this);
							version.complete = false;
						});
						m.build(this);
				});

				this.Workspace = Seq(this.Workspace).concat(Seq(this.Workspace).map((_, k) => this.Model[k])
                                          .filter(e => e && e.originId !== undefined)
                                          .sortBy(e => e.updated).toMap()
                                          .mapEntries(([_, e]) => [e.originId, e]))
                                          .toObject();

				const course = this.routerGetCourse();
				if (course) {
					this.courseSelect(course);
				}

				const e = this.modelGetPath(this.routerGetModelPath());
				if (e) {
					state.master = e.path[0];
					state.layout = this.layoutDefault(e, this.state.layout);
					state.favorites = this.layoutGetFavourites(e);
				} else {
						state.master = state.layout = state.version = undefined;
				}

				const test = () => {
					if(state.master){
						this.modelGet(e, true, undefined, undefined, state, true).then(e => { });
						this.routerGoTo(e, "replace");
					}
				}

				this.setState(state, test);

				this.props.modelsInit(reduxData);
				if(state.master){
					this.props.modelSelect(state.master);
				}

		}

    _modelList(workspace) {
        this.setState({modelCartLoading: true})
        this.ajax("api/model", null, ({ data }) => {
						const type = Application.domain === "research" ? "research" : "learning";
						// backward patch, ugly.
						const patchModelAPI 	= m => {
							const user = this.state.user || { };

							m.modelType = m.model.modelType;

							if ( !["boolean", null].includes(m.modelType) ) {
								const currentVersion = m.versions.find(v => v.id == m.defaultVersion);

								m.model = {
									id: m.id,
									name: m.name,
									type: m.domainType,
									userId: m._createdBy,
									published: m.public,
									currentVersion: currentVersion && currentVersion.version,
									nMetabolites: currentVersion ? currentVersion.n_metabolites : 0,
									nReactions: currentVersion ? currentVersion.n_reactions : 0,
									created: m._createdAt,
									biologicUpdateDate: m._updatedAt,
									knowledgeBaseUpdateDate: m._updatedAt,
									modelVersionMap: Seq(m.versions).reduce((prev, next) => {
										next = {
											[next.version]: {
												userId: next._createdBy,
												selected: m.defaultVersion == next.id
											}
										}
										return { ...prev, ...next }
									}, { })
								}

								m.modelPermissions = {
									view: 		true,
									edit: 		m._createdBy == user.app_user_id,
									delete: 	m._createdBy == user.app_user_id,
									share:		m._createdBy == user.app_user_id,
									publish: 	m._createdBy == user.app_user_id
								}

								m.metadataValueMap = {

								}

								m.metadataRangeMap = {
								}
							}
							return m;
						};
						data = data.map(m => patchModelAPI(m));
            data = data.filter(e => e.model && e.model.userId !== null && (e.model.type === type || e.modelPermissions.edit));

            this.setState({ modelCartLoading: false })

            this.ajax("_api/user/lookupUsers?" + Seq(data.map(e => e.model.userId)).toSet().filter(e => e).map(e => "id=" + e).join("&"), null, u => {
                this.User = u;
                const getE = m => Seq(m.model).mapEntries(([k, v]) => [Application.properties.ModelVersion.from[k] || k, v]).toObject();

                const globalEntities = Seq(this.entities).filter(e=>e.global).cacheResult();

								const reduxData = { };

                const state = { Model: new Immutable.Map(data.map(async mp => {
											const e = getE(mp);
											const id = e.id = e.id.toString();
											e.currentVersion = (e.currentVersion || 1).toString();
											e.hash = mp.hash;
											e.modelType = mp.modelType;
											e.created = new Date(e.created);
											e.updated = new Date(Math.max(new Date(e.biologicUpdateDate).getTime(), new Date(e.knowledgeBaseUpdateDate).getTime()));
											const modelE = new Immutable.Map({
												currentVersion: e.currentVersion.toString(),
												originId: e.originId,
												id: id,
												type: e.type,
												modelType: e.modelType,
												userId: e.userId,
												name: e.name,
												description: e.description
											});
											const m = this.Model[id] = new Model(modelE);
											this.Persisted[id] = new Model(modelE);
											m.user = u[e.userId];
											m.permissions = mp.modelPermissions;
											m.isPublic = e.published;
											m.coverImage = mp.coverImage;

											const models = {};
											const pmodels = {};
											let selected;
											const r = Seq(e.modelVersionMap).map((v, version) => {
													version = cc._.cstr(version);
													const map = (new Immutable.Map(e)).withMutations(m=>{
														m.delete("workspaceLayout");
														m.set('id', version);
														m.set('name', v.name || version);
														m.set('description', v.description);
													});
													const ModelClass = this.getModelTypeClass(m.modelType);

													const model  = models[version] = new ModelClass(map);
													const pmodel = pmodels[version] = new ModelClass(map);
													this.Model[id].add(model);
													this.Persisted[id].add(pmodel);

													v.selected && (selected = model);

													pmodel.numNodes = model.numNodes = e.components;
													pmodel.numEdges = model.numEdges = e.interactions;

													if( m.modelType === 'metabolic' ) {
														pmodel.nMetabolites = model.nMetabolites = mp.model.nMetabolites;
														pmodel.nReactions   = model.nReactions   = mp.model.nReactions;
													}

													Seq(Application.entities).filter(e => e.isPublic).forEach((v, t) => model[t] = Seq(mp[v.source]).map((v, k) => new Entity[t](this.convert(t, k, v))).toObject());
													Seq(Application.entities).filter(e => e.isPublic).forEach((v, t) => model[t] = Seq(mp[v.source]).map((v, k) => new Entity[t](this.convert(t, k, v))).toObject());

													const d = this.MetadataDefinition;
													Seq(mp.metadataValueMap).concat(mp.metadataRangeMap).groupBy(e => e.definitionId).forEach((v, t) => (t = d[t]) && (model[t.className] = v.map((v, k) => new t(this.convert(t.className, k, v))).toObject()));

													return model.self;
											}).toObject();

											selected && (r.selected = selected);
											const entities = this._modelGetEntitiesDef(globalEntities, mp, this.Model[id], Seq());
											this._modelAddEntities(globalEntities, entities, this.Model[id], this.Persisted[id]);

											const map = new Immutable.Map(r).merge(Seq(entities)).merge(m.self);

											reduxData[id] = true;

											this.Model[id].self = this.Persisted[id].self = map;
											return [id, map];
									})),
                };
                state.Layouts = new Immutable.Map(data.map(mp=>{
                    const e = getE(mp);
                    const id = e.id = e.id.toString();
                    return [id, Seq(e.modelVersionMap).map((_, version) => (this.Persisted[id].sub(version+"").workspaceLayout = new Immutable.Map(e.workspaceLayout))).toMap()];
								}));
                Seq(this.Model).forEach( m => {
                    Seq(m.all()).forEach(version => {
											version.build(this);
											version.complete = false;
										});
                    m.build(this);
								});

                this.Workspace = workspace.concat(workspace.map((_, k) => this.Model[k])
                                          .filter(e => e && e.originId !== undefined)
                                          .sortBy(e => e.updated)
                                          .mapEntries(([_, e]) => [e.originId, e]))
                                          .toObject();

                const e = this.modelGetPath(this.routerGetModelPath());
                if (e) {
                    state.master = e.path[0];
					state.layout = this.layoutDefault(e, this.state.layout);
                } else {
                    state.master = state.layout = state.version = undefined;
                }

                const test = () => {
                  if(state.master){
                    this.modelGet(e, true, undefined, undefined, state).then(e => { });
                    this.routerGoTo(e, "replace");
                  }
								}

                this.setState(state, test);

								this.props.modelsReplace(reduxData);
                if(state.master){
                    this.props.modelSelect(state.master);
								}

								const getMap = m =>
										Seq(m)
										.map(m => m.sub())
										.toMap();
								const user = this.getUser(this.state.user)
								if(Application.domain === 'learning' && user !== null && source(getMap(this.Model), user).count() > 0){
									this.setState({section: ['translate:ModelDashBoard.Learning.LabelMyLearning']});
								}
            });
		});
    }
    modelSetDefaultVersion(m) {
        this.entityUpdate([new Update(m.top, 'selected', m)]);

/*        const unmark = Seq(m.top.all()).filterNot(e=>e===m).filter(m=>m.selected && this.modelIsShareAndEditable(m));
//        this.modelGetMore(unmark.toIndexedSeq().concat(Seq([m])), (s) => {
        let state = this.state;
        unmark.forEach(e => {state = this.entityUpdate([new UpdateProperty('selected', false)], undefined, {...this.state, ...state}, true, e.id)});
        this.entityUpdate([new UpdateProperty('selected', true)], undefined, {...this.state, ...state}, true, m.id);
//        });
*/
		}
    modelGetPath(p,o = this.Model, forced=false){
			if(!Array.isArray(p)) p = [p];
			let e = p && o[p[0]];
			if(e){
					Seq(p).skip(1).forEach(i => {
						if(e){
							e = e.sub(i, forced);
						}
					});
					if(forced && (!e || e.sub)) return undefined;
					while(e && e.sub && e.sub()) { e = e.sub(); }
			}
			return e;
	}
    modelLayoutSave(m, action){
        if(!m) {
						m = this.modelGetPath(this.state.detail);
				}
        m = m.top;
        const save = () => {
            this.setState({saving:true});
            !action && this.loggerAdd("Model", "layoutSave");

            const models = {};
            const data = Seq(m.all()).mapEntries( ([_, m]) => {
              const k = m.persistedPath.join('/');
              const l = this.state.Layouts.getIn(m.path);
              models[k] = {self: m, layout: l};
              return [k, { workspaceLayout: l && l.toJS() }];
            } ).filter(e=>e).toObject();

            this.ajax("_api/model/save", data, e => {
                Seq(e).forEach((_,k) => {
                  this.modelGetPath(models[k].self.path, this.Persisted).workspaceLayout = models[k].layout;
                });
                this.setState({saving:false});
                action && action();
            });
        }

        Seq(m.all()).every(m=>m.isPersisted) ? save() : this.modelSave(save).then(() => {});
		}
		modelSearch(value){
			this.setState({searchCartLoading: true })
			if (value !== this.state.searchValue) {
				const v = new RegExp(value, "i");
				const f = (p, e) => {
					if(value === "MISSING_PREVIEWS") {
						return e["coverImage"] === null;
					}
					return  e[p].search(v) >= 0;
				}
				this.setState({
						searchValue: value,
						searchCartLoading: false,
						searchResult: {
							value: value,
							data: () => Seq(this.Model).filter(e => f("name", e)).sortBy(e => e.name.toLowerCase()).map(e=>e.cur())
						}
				});
		}
	}

    modelGetSelectedDetail(s = this.state, persist){
        if(!Array.isArray(s))
            {s = s && s.detail;}
        return this.modelGetPath(s, persist ? this.Persisted : this.Model);
		}

    _modelGetEntitiesDef(entDef, data, model, inner){
      return entDef.filter(e => e.source).map((e, t) => {
					const s = Seq(data[e.source]).map((v, k) => this.convert(t, k, v, inner));
					try{
						let mapEntity = Seq(model[t]).map(e => e.self)
						return (e.isPublic ? mapEntity.concat(s) : s).toMap();
					} catch(err){
						console.error(err.message)
						return Seq({});
					}
      }).cacheResult();
		}

    _modelAddEntities(entDef, entities, model, persisted){
        Seq(entDef).forEach(assignEntityProperties(model, entities, persisted));
    }

		modelParse(model, select, f, f2, data, curState, { modelType = "boolean" } = { }){
			const ModelClass = this.getModelTypeClass(modelType);

			return new Promise((resolve, reject) => {
					const load = () => {
								let rejected = false;
								this.setState(
										(curState) => {
											try{
												let {Model, master} = curState;

													Seq(data.shareMap || {}).filter(e => e).filterNot(e => e.email || e.userId === null).forEach(e => e.email = this.User[e.userId].email);
													if (!(model instanceof ModelClass)) return;
													const path = model.path;
													const id = path[0];
													const stateKey = this.stateGetKey(model);
													model.self = Seq(
																					model.self
																							.delete('layoutId')       // FIXME: remove these 2 from model/get API request
																							.delete('initialStateId')
																				)
														.concat(Seq(ModelClass.prototype.properties).map((_,k)=>data[k]).filter(e=>e!==undefined))
														.toMap();
													const binned = Seq(Application.entities).filter(e=>e.bin).cacheResult();
													const allbins = binned.map(e=>e.bin).groupBy(e=>e).map(e=>e.first());
													binned.forEach((e,k)=>{
														if (!data[e.source] && data[e.bin]) {
																data[e.source] = data[e.bin][e.source];
														}
													});
													allbins.forEach(e=>{data[e] && delete data[e];});
													const d = this.MetadataDefinition;
													let inner = Seq(Application.entities).filterNot(e => e.source).map(() => new Immutable.Map().asMutable()).toObject();
													let entities = this._modelGetEntitiesDef(Seq(Application.entities).filterNot(e=>e.global), data, model, inner);
													const metadata = t => {
															const p = Seq(data[t]).groupBy(e => e.definitionId).mapEntries(([t, v]) => [t = d[t].className, v.map((v, k) => this.convert(t, k, v)).toMap()]).toObject();
															return Seq(this.entities).filter(e => e.source === t).map((e, k) => ((e = model[k]) ? Seq(e).map(e => e.self).toMap() : p[k] || new Immutable.Map()));
													};
													// TODO: remove this after api refactor
													const sm = data.speciesMap;
													inner = Seq(inner).map(e => e.filter(e => sm[e.get("componentId")]));
													const wasSame = (this.Persisted[id] || {}).self === Model.getIn([id]);

													const state = { Model: Model.asMutable().mergeIn(path, entities.concat(Seq(inner).map(e => e.asImmutable()), metadata("metadataValueMap"), metadata("metadataRangeMap")))};
													state.Model.setIn(path.concat(["score"]), data.score && data.score.score);

													select && master === id && ( state.detail = path );
													entities = state.Model.getIn(path);
													model.history = new History();
													const persisted = this.modelGetPath(path, this.Persisted);
													persisted && (persisted.self = model.self);

													this._modelAddEntities(Seq(this.entities).filter(e=>!e.global), entities, model, persisted);

													model.build(this);
													persisted && persisted.build(this);
													let modelType = model.modelType;
													let type = "Component";
													if (modelType === "pharmacokinetic") {
															type = "PKCompartment";
													}
													state.Model = state.Model.setIn(path, this.modelLayout(type, entities, model, model.nodes.map((_, k) => ({ id: k })), model.edges)).asImmutable();

													persisted && persisted.set(model.set(state.Model.getIn(path)).self, true);
													state[stateKey] = this.modelStateInit(model);

													model.complete = true;
													Model = Model.setIn(path, state.Model.getIn(path));
													model.fixSelf(Model);
													wasSame && persisted && (persisted.top.self = Model.getIn(persisted.top.path));
													f && f(Seq(curState).concat(state).toObject());
													return Seq(state).concat(select && master === id ? {layoutConf: this.layoutGetConfiguration(model)} : {}).concat({Model}).toObject();
												}catch(e){
													rejected = true;
													reject(e);
												}
										},
										() => { if (!rejected) { f2 && f2(); select && this.modelInitState(model); resolve(); } } );
					};
					const u = Seq(data.shareMap || {}).map(e => e.userId).filter(e => e && !this.User[e]).toArray();
					u.length ? this.ajax("_api/user/lookupUsers?" + u.filter(e => e).map(e => "id=" + e).join("&"), null, e => load(this.User = Seq(this.User).concat(e).toObject()), reject) : load();
			});
		}

		_patchModelVersionData (versionData) {
			let patchedVersionData = { };

			const _toMap = arr => {
				const map = { };

				for ( const o of arr ) {
					map[o.id] = o;
				}

				return map;
			};

			if ( versionData.modelType == "metabolic" ) {

				// let getCompartName = (c =>
				// 	id => c.has(id) && c.get(id).name
				// )(Seq(versionData.compartments));

				patchedVersionData = {
					...versionData,
					compartmentMap: versionData.compartments,
					metaboliteMap: versionData.metabolites,
					subSystemMap: versionData.subsystems,
					reactionMap: versionData.reactions,
					reactionMetaboliteMap: versionData.reactionMetabolites,
					//geneMap: versionData.genes,
					regulatorMap: versionData.regulators,
					conditionMap: versionData.conditions,
					conditionGeneMap: _toMap(
						Seq(versionData.conditions)
							.map((c, cid) => c.genes.map(g => ({
								id: Entity.newId(),
								geneId: g,
								parentId: cid
							})))
							.toArray()
							.flat()
					),
					subConditionMap: versionData.subConditions,
					subConditionGeneMap: _toMap(
						Seq(versionData.subConditions)
							.map((c, cid) => c.genes.map(g => ({
								id: Entity.newId(),
								geneId: g,
								parentId: cid
							})))
							.toArray()
							.flat()
					),
					objectiveMap: versionData.objectives,
					objectiveReactionMap: _toMap(
						Seq(versionData.objectives)
							.map((o, oid) =>
								Object.keys(o.reactions || {}).map(rid =>
									({
										id: Entity.newId(),
										reaction: parseInt(rid),
										coefficient: o.reactions[rid],
										objectiveFunction: parseInt(oid)
									})
								)
							)
							.toArray()
							.flat()
					),
					annotationMap: versionData.annotations
				}
			} else if (versionData.modelType === "kinetic") {
				patchedVersionData = {
					...versionData,
					compartmentMap: versionData.compartments,
					metabolites: versionData.species,
					reactionMap: versionData.reactions,
				}

				for (let kineticLawId in patchedVersionData.kinetic_laws ) {
					const kineticLaw = patchedVersionData.kinetic_laws[kineticLawId];
					kineticLaw.reaction_id = kineticLaw.reaction;
				}

			} else if (versionData.modelType === "pharmacokinetic") {
				patchedVersionData = {
					...versionData,
					compartmentMap: versionData.compartments,
					rates: versionData.rates,
				}
			}
			return patchedVersionData;
		}

    async modelGet(e, select, f, f2, curState, refresh = false) {
        curState = {...this.state, ...(curState || {})};
        (e instanceof Model) && (e = e.sub());
        const id = e.parent.id;
        const version = e.parent.getVersion ? e.parent.getVersion : (e.id || 1);
				const onlyPublic = this.onlyPublic == false ? false : true;

        const stateKey = this.stateGetKey(e);
        if(this.state[stateKey]){
					return;
        }else{
					return await new Promise((resolve, reject) => {
						const isInited = this.Pending[stateKey];
						if(!isInited){
							this.Pending[stateKey] = [];
						}
						this.Pending[stateKey].push({resolve, reject});
						if(!isInited){
							(async () => {
								try {
									const data = await this.ajaxPromise(`api/model/${id}/version/${version}?${cc._.constructGetParams({
											hash: e.hash,
											slim: true,
											domain: Application.domain,
											modeltype: e.modelType,
											courseId: e.parent.courseId || 0
									})}`);
									let versionData = data.data;

									if ( versionData.modelType ) {
										versionData = this._patchModelVersionData(versionData);
									} else {
										versionData	= Object.entries(versionData)[0][1]; //versionData[`${id}/${version}`];
									}

									await this.modelParse(e, select, f, f2, versionData, curState, {
										modelType: e.modelType
									});

									if(this.Pending[stateKey]){
										this.Pending[stateKey].forEach(({resolve}) => resolve(e));
										delete this.Pending[stateKey];
									}
								}catch(e){
									if(this.Pending[stateKey]){
										this.Pending[stateKey] .forEach(({reject}) => reject(e));
										delete this.Pending[stateKey];
									}
								}
							})();
						}
					});
        }
		}

    modelInitState(m, detail){
        const c = this._persisted.model = this.persistLoad.model(detail);
        detail && (c.layout = typeof detail === "string" ? detail : this.layoutDefault(m));
		}

    modelSelect(detail, e, d, layout, d2) {
        (e instanceof Model) && (e = e.sub());
				if (!e) return;
				const path = e.path;
				const { currLesson } = this.props;

        const f = (typeof d === "function") && d;
        const f2 = (typeof d2 === 'function') && d2;
        const state = Seq(detail ? this.layoutGetInitState(e) : {}).concat({ master: path[0] }).toObject();

        state.forceLayout = typeof layout === "string" ? layout : undefined;
        if(detail){
            this.props.modelSelect(path[0]);
            state.forceLayout = state.layout = state.forceLayout || (typeof detail === "string" ? detail : this.layoutDefault(e));
        }else{
            state.forceLayout = "";
        }

        if (this.state[this.stateGetKey(e)]) {
            state.detail = path;
            this.setState(state, () => {
							new Promise((done) => {
								this.modelInitState(e, false); f2 && f2(); done();
							}).then(async () => {
								if (!Application.isLearning
									|| !('Survey' in e)
									|| Object.keys(e.Survey).length == 0
									|| !path[1]) {
									return;
								}
								console.log("Populating lesson data with survey and graph information...");

								//Survey data should be loaded only once
								let loadedSurveyKey = `${path[0]}:${path[1]}`;
								this.setState((prev) => ({...prev, loadedSurveys: this.state.loadedSurveys.add(loadedSurveyKey)}));
								if (this.state.loadedSurveys.has(loadedSurveyKey)) { return;	}

								try {
									// Retrieve survey data for the model
									// TODO: Optimize this process to handle multiple lessons from the original Lesson ID more efficiently.
									let courseId = this.course || 0;
									let category = this.openedFromCategory || 'ALL';
									if (this.openedFromCategory == APP_MODEL_CATEGORIES.MY_COURSES && !courseId) {
										courseId = 999999999;
									}
									if (Array.isArray(this.state.section)
										&& this.state.section[0].indexOf('LabelMyLearning') >= 0) {
											category = APP_MODEL_CATEGORIES.MY_LEARNING;
									}
									if (Application.isModelIt === false) {
										const surveyFinished = await this.ajaxPromise(`api/module/${path[0]}/survey?version=${path[1]}&domain=${Application.domain}&course=${courseId}&category=${category}`);
										if (surveyFinished.data && surveyFinished.data.lessonId) {
											let versionId = surveyFinished.data.versionId;
											const dataModelReq = await this.ajaxPromise(
												`api/model/${versionId}/version/${path[1]}?hash=${e.hash}&slim=true&domain=${Application.domain}&modeltype=${e.modelType}&courseId=${courseId}&survey=true`
											);
											let versionData = dataModelReq.data;
											if ( versionData ) {
												versionData = Object.values(versionData)[0];
												await this.modelParse(e, false, undefined, undefined, versionData, state, {
													modelType: e.modelType
												});
											}
										} else {
											console.log(`Not found survey data for model ${path[0]}/${path[1]}`);
										}		
									}
																
								} catch(err) {
									console.error("Unable to read survey data: ", err.message, err);
								}
							}).catch(err => {
								console.error("Unable to read model initial state: ", err.message, err);
							});
						});
            f && f();
        }
        else {
            if(!detail){ state.detail = undefined; }
            this.setState(state);
            this.modelGet(e, true).then(() => {
                this.modelSelect(detail, e, d, layout, d2);
            });
        }

        detail && this.routerGoTo(e, !d && "replace");
		}

    modelInit(e, resetLayout, state = {}) {
        const path = e.path;
        e.history = new History();
        state = Seq(this.layoutGetInitState(e)).concat({
            master: path[0],
            detail: path,
            searchValue: undefined,
            searchResult: undefined
        }).concat(resetLayout ? {
            layoutModelSave: undefined,
            layout: this.layoutDefault(e),
            section: ["My Models"],
        } : {}).toObject();
        state[this.stateGetKey(e)] = this.modelStateInit(e);
        return state;
    }

		modelCreateNew({ modelType = "boolean" } = { }) {
        const domain = Application.domain;
        if(!this.Model) return;

				if (this.props.user && !this.props.user.app_user_id) {
					throw new Error("The User ID was not found!");
				}

				const now = new Date();
				const ModelClass = this.getModelTypeClass(modelType);

        const v = new ModelClass({
            name: "1.0",
            created: now,
            updated: now
        });

        const m = new Model({
					type: domain === "teaching" ? "learning" : "research",
					modelType: modelType,
					name: Application.defName(this.Model, "New Model "),
					userId: this.props.user && this.props.user.app_user_id,
					currentVersion: v.id
				});

        m.add(v);
        return m;
		}

    modelAdd(e, cbk, { modelType = "boolean" } = { }) {
        if(e === undefined) {
					e = this.modelCreateNew({ modelType });
			  }
        const id = e.id;
        this.layoutDeleteLocalPositions(e);
        e.user = this.state.user;
        e.permissions = { edit: true, share: true, delete: true };
        this.Model[id] = e;

        const es = {entities: new Immutable.Map()};
        const addEntities = (def,e,path=[]) => {
            def.forEach( (_, k) => { e["_" + k] = e["_" + k] || {}; e[k] = e[k] || {}; } );
            es.entities = es.entities.mergeIn(path, def.map(e=>new Immutable.Map()).toMap());
        };

        addEntities(Seq(this.entities).filter(e=>e.global), e);
        Seq(e.all()).forEach(e => {
          addEntities(Seq(this.entities).filterNot(e=>e.global), e, [e.id]);
        });
        e.build(this);

        const v = e.cur();

        this.props.modelsInit({[id]:true});

        const newState = this.modelInit(v, true);
        this.modelSetState(v, newState, typeof cbk === "function" && cbk, (s) => {s.Model = s.Model.setIn(e.path, es.entities).mergeIn(e.path, e.self).mergeIn(v.path, v.self); return s; });
				this.routerGoTo(v);

        if(newState.master) {
					this.props.modelSelect(newState.master);
				}
		}

    modelAddVersion(source, parent) {
        const e = this.state.Model.getIn(source.path);

        const defNameVersion = (v, test) => {
            const getVerName = (m) => m.name;
            const p = getVerName(v).split('.');
            if(/^[0-9]+$/g.test(Seq(p).last())){ p[p.length - 1] = parseInt(Seq(p).last())+1; } else { p[p.length] = 1; }
            Range(parseInt(p[p.length-1]), Infinity).find(e=>((p[p.length-1] = e),Seq(test||[]).every(m=>getVerName(m)!=p.join('.'))));
            return p.join('.');
        }

        const verName = defNameVersion(source, parent.top.all());

        const v = this.modelCopyVersionInternal(verName, source, parent, (source, t, s, c) => {
            const e = this.state.Model.getIn(source.path);
            if(t === 'LearningActivity' || t === "LearningActivityGroup") return new Immutable.Map();
            return e.get(t) ? e.get(t).sortBy((_, k) => +k).map(e => new Entity[t](s ? e : e.set("id", Entity.newId()).delete("userId"))) : new Immutable.Map();
          }, undefined, (c) => {
            c.self = c.self.set("currentVersion", -1).set('created', source.created);

            this.layoutDeleteLocalPositions(c);
            const oldlk = this.layoutGetSaveKey(source);
            const newlk = this.layoutGetSaveKey(c);
            this.stateCopyPersistentStorage(localStorage, oldlk, newlk);
            this.stateCopyPersistentStorage(localStorage, oldlk+'.modelLS', newlk+'.modelLS');
        }, undefined, undefined, true);

        parent.add(v);

        const newState = this.modelInit(v);
        this.modelSetState(v, newState, undefined , ({Model, ...args})=>({...args, Model: Model.setIn(v.path, v.self), layoutConf: this.layoutGetConfiguration(v)}) );
        this.props.modelSelect(newState.master);
				this.routerGoTo(v);


				return v
    }

		async modelImport(files, { modelType = "boolean" } = { }) {
				let importFailure = false;
				let importMessage = null;

				this.setState({
					isModelImporting: true
				});

        const data = new FormData();
				data.append("type", modelType);
				data.append("slim", true);

				for ( const file of files ) {
					data.append("file", file);
				}

				const cbImportingDone = (result) => {
						if ( modelType == "boolean" ) {
							const now = new Date();
							const versions = [ ];

							const models = result;

							const ModelClass = this.getModelTypeClass(modelType);

							for ( let i = 0 ; i < models.length ; ++i ) {
								const version = new ModelClass({ name: `Version ${1}`,
									created: now, updated: now });
								versions.push(version);
							}

							if ( versions.length ) {
								// Assumptions as of now is still the default version is 0.
								// TODO: Work on multiple imports
								const defaultVersion = versions[0];

								const modelData = models[0].data
								let versionData = { };

								versionData = modelData['1']

								// if ( modelType == "boolean" ) {

								// } else {
								// 	this.ajax(`api/model/${parseInt(modelData.id) * -1}`, null, null, null, null, null, null, { requestMethod: "DELETE" });
								// 	versionData = this._patchModelVersionData(modelData.versions[0])
								// }

								const model = new Model({
									type: (Application.domain === "teaching" ? "learning" : "research"),
									name: versionData.name,
									userId: this.state.user && this.state.user.id,
									currentVersion: defaultVersion.id,
									modelType
								});

								for ( const version of versions ) {
									model.add(version);
								}

								this.modelAdd(model, async () => {
									await this.modelParse(defaultVersion, true, (state) => {
										defaultVersion.set(defaultVersion.self.mergeIn(state.Model.getIn(defaultVersion.path)));
											this.modelSetState(defaultVersion, Seq(this.modelInit(defaultVersion, true, state))
														.concat({isModelImporting: false}).toObject());
											this.routerGoTo(defaultVersion);
									}, undefined, versionData, this.state, { modelType });
								}, { modelType });
							} else {
								throw new Error(`You will have to login or create an account for this feature.`);
							}
						} else if ( modelType == "metabolic" ) {
							if ( !this.state.user ) {
								throw new Error(`You will have to login or create an account for this feature.`);
							}
						}
				}

				try {
					const importResponse = await this.ajaxPromise("api/model/import", data);
					let attempts = 0, attemptsTime = 6500;
					const checkStatusImport = setInterval(async () => {
						const timeProcess = new Date();
						try {
							attempts++;
							console.log("Checking importing status ... ", timeProcess.toLocaleTimeString());
							const response = await this.ajaxPromise("api/model/import/status?id="+importResponse.data.id);
							if (response.data.status === 'DONE') {
								clearInterval(checkStatusImport);
								cbImportingDone(response.data.result);
							}
							const loadTime = ((attemptsTime*attempts)/1000)/60;
							if (loadTime > 10) {
								throw new Error(`The time limit for importing exceeded a total of ${Math.ceil(loadTime)} minutes.`);
							}
							this.setState({ isModelImporting: false });
						} catch (err) {
							clearInterval(checkStatusImport);
							this.setState({ isModelImporting: false });
							this.showDialog(Message, { message: "Error during checking importing model. "+err.message });
						}
					}, attemptsTime);

				} catch (e) {
					this.setState({isModelImporting: false});
					this.showDialog(Message, { message: importMessage || "Unknown error during importing model occured." });
				}
		}

    modelSetState(m, d, cbk, replace) {
        setTimeout(() => {
            replace = replace || (e=>e);
            this.setState(({Model, Layouts}) => {
								Model = Model || Immutable.Map();
								Layouts = Layouts || Immutable.Map();
                Model = Model.setIn(m.path, m.self);
                const ret = replace(Seq(d).concat({ Model, Layouts: Layouts.setIn(m.path, new Immutable.Map()) }).toObject());
                m.fixSelf(ret.Model);
                return ret;
            }, () => {
              if(m.layoutId && Seq(m.Layout).find(e=>m.layout) === undefined){
                throw new Error("INTERNAL ERROR");
              }
              cbk && cbk();
            });
          },0);
		}

		_syncEntityLinks(modelWithIdMap) {
			const IDMap = modelWithIdMap["_id_map"];
			const c = modelWithIdMap;

			Seq(Entities).filter((_, entity) => Entity[entity].prototype.links).forEach((_, entity) => {
				const links = Entity[entity].prototype.links;
				Seq(links).forEach((sourceField, field) => {
					Seq(c[entity]).forEach(entity => {
						const cur = entity[field + "Id"];
						if (!IDMap.hasIn([sourceField, cur])) {
							return;
						}
						const newId = IDMap.getIn([sourceField, cur]);
						entity.update(field + "Id", newId);
					});
				});
			});

			delete modelWithIdMap["_id_map"];
		}

    modelCopyVersionInternal(name, source, parent, f, changes, onCreate, onCreateMap, mapEntity, byUser) {
				const ModelClass = this.getModelTypeClass(source.modelType);
				const c = new ModelClass();
        c.parent = parent;
				let id = c.id;

        onCreate && onCreate(c);
				id = c.id;

        const entities = Seq(this.entities).filter(e=>!e.global);

        c.set(Seq(Model.prototype.properties).map((_, k) => source[k]).toMap().withMutations(m => {
            m.set("id", id);
            m.set("name", name);
            const now = new Date();
            m.set("created", now);
            m.set("updated", now);
            m.delete("score");

						// If the function "f" constructs an ID map from old IDs to new IDs,
						// then sync the entity links.
            entities.forEach((v, k) => c[k] = (v.isPrivate || (byUser && v.addVersionCopied === false)) ? new Immutable.Map() : f(source, k, v.isShared, c).toMap());
						if ("_id_map" in c) this._syncEntityLinks(c);

            changes && Seq(typeof changes === 'function' ? changes() : changes).forEach((v, k) => c[k] = c[k].concat(new Immutable.Map(v.map(e => [e.id, e]))));

//            let ent = Seq(c['ModelVersionDef']).first();
//            c['ModelVersionDef'] = new Immutable.Map({id: new ModelVersionDef(ent.self.set('id', id))});

            const ref = (k, s, t) => {
                const p = s[k];
                p && t.set(k + "Id", c[p.className].get(p.id).id);
            };
            const inst = mapEntity || ((k, s, t) => {
                const mapInstances = (v) => {
                  if(v instanceof Entity) return c[v.className].get(v.id);
                  if(v && v.map) return v.map(mapInstances);
                  return v;
                }
                const p = s[k];
                p && t.set(k, mapInstances(p));
            });

            Seq(ModelClass.prototype.sources).forEach((_, k) => ref(k, source, m));
            entities.forEach((_, t) => c[t].forEach((v, k) => {
                const e = source[t][k];
                v.set(v.self.withMutations(m => Seq(Entity[t].prototype.sources).forEach((_, k) => ref(k, e, m))));
                v.set(v.self.withMutations(m => Seq(Entity[t].prototype.properties).filter(e=>e&&e.fromRaw).forEach((_,k) => inst(k, e, m, _.fromRaw, c))));
            }));
            c.Experiment.forEach(e => e.set(e.self.delete("state")));

            entities.forEach((_, t) => {
                m.set(t, c[t].mapEntries(([_, v]) => [v.id, v.self]).toMap());
                const e = c[t].mapEntries(([_, v]) => [v.id, v]);
                c["_" + t] = e.toObject();
                c[t] = e.toObject();
            });

            onCreateMap && onCreateMap(m);
        }));

        //fix modelVersionDef id
//        let entity = Seq(c.ModelVersionDef).first();

        c.build(this);
        this.modelSetState(c, this.modelInit(c), () => {this.layoutSetValue();});
        return c;
		}

    modelCopyInternal(name, source, f, type, changes, onCreate, onCreateMap, mapEntity, alertCopy) {
        return new Promise((resolve, reject) => {
            try{
                if(source instanceof ModelEntity)
                    {source = source.top;}

								// This is just a patch; it may be better to use source.Persist
								// instead of source.id, and trigger an error if source.Persist
								// does not exist/is negative
								if (source.top._id > 0 && source.id < 0) {
									return null;
								}
								if (source.id < 0) {
									alertCopy.id = source.id;
									reject("This model has just been initialized. Please reload before attempting to make another copy.");
									return;
								}

                const c = new Model();
                let id = c.id;
                this.props.modelCopy(source.id, id);

                onCreate && onCreate(c);
                id = c.id;
                c.user = this.state.user;
                c.permissions = { edit: true, share: true, delete: true, publish: true };

                c.set(Seq(Model.prototype.properties).map((_, k) => source[k]).toMap().withMutations(m => {
                    let u = c.user && c.user.id;
                    m.set("id", id);
                    m.set("type", type || (Application.domain === "teaching" ? "learning" : Application.domain));
                    m.set("name", name);
                    const now = new Date();
                    m.set('originId', source.id);
                    m.set("userId", u);
                    m.set("author", source.author || (source.userId === u ? null : (u = source.user) && (u.firstName || "") + " " + (u.lastName || "")));
                    m.delete("score");
                }));

                this.Model[id] = c;

                setTimeout(() => {
                    this.setState(({Model}) => ({Model: Model.mergeIn(c.path, c.self)}));
                },0);

                const modelVersionIds = {};
                let selected;
                Seq(source.all()).forEach(v => {
                    const add = this.modelCopyVersionInternal( v.name, v, c, f, changes, (m) => {
                    if(source.currentVersion == v.id){
                        c.self = c.self.set("currentVersion", m.id);
                        this.setState(({Model}) => ({Model: Model.mergeIn(c.path, c.self)}));
                    }
                    onCreate(m);
                    });
                    if(v.selected) selected = add;
                    modelVersionIds[v.id] = add.id;
                    c.add(add);
                });

                const entities = Seq(this.entities).filter(e=>e.global);
                c.self = c.self.withMutations(m=>{
                    if(selected) { m.set('selected', selected); }

                    const ref = (k, s, t) => {
                        const p = s[k];
                        p && t.set(k + "Id", c[p.className].get(p.id).id);
                    };


                    const inst = mapEntity || ((k, s, t) => {
                        const mapInstances = (v) => {
                        if(v instanceof Entity) return c[v.className].get(v.id);
                        if(v && v.map) return v.map(mapInstances);
                        return v;
                        }
                        const p = s[k];
                        p && t.set(k, mapInstances(p));
                    });

                    entities.forEach((v, k) => c[k] = v.isPrivate ? new Immutable.Map() : f(source, k, v.isShared, c).toMap());

                    entities.forEach((_, t) => c[t].forEach((v, k) => {
                        const e = source[t][k];

                        v.set(v.self.withMutations(m => Seq(Entity[t].prototype.sources).forEach((_, k) => ref(k, e, m))));
                        v.set(v.self.withMutations(m => Seq(Entity[t].prototype.properties).filter(e=>e&&e.fromRaw).forEach((_,k) => inst(k, e, m, _.fromRaw, c))));

                        if(t == "LearningActivity"){
                        if(modelVersionIds[v.version]){
                            v.set(v.self.set('version', modelVersionIds[v.version]))
                        }
                        }
                    }));
                    entities.forEach((_, t) => {
                        m.set(t, c[t].mapEntries(([_, v]) => [v.id, v.self]).toMap());
                        const e = c[t].mapEntries(([_, v]) => [v.id, v]);
                        c["_" + t] = e.toObject();
                        c[t] = e.toObject();
                    });
                });

                c.build(this);

                const v = Seq(c.all()).first();
                const newState = this.modelInit(v);
                this.modelSetState(v, newState, () => {resolve(c); this.layoutSetValue()});
                if(newState.master){
                    this.props.modelSelect(newState.master);
                }
                this.routerGoTo(v);
            }catch(e){
                reject(e);
            }
        });
		}

		async modelLoadAllVersions(source){
			return await Promise.all(
				Seq(
						source.top.all()).map(
								(version) => this.modelGet(version)
					).toArray()
			);
		}

    async modelCopy(name, source, type, changes, after) {
			// Make sure all versions are loaded
			try {
				await this.modelLoadAllVersions(source);
			} catch (err) {
				this.showDialog(Message, {message: "Could not copy model versions: "+ errorResponse(err).message});
				return null;
			}
			let alertCopy = {id: 0};
			try {
				const mc = await this.modelCopyInternal(name, source, (source, t, s, c) => {
						const e = this.state.Model.getIn(source.path);
						const idMap = {};
						const createEntity = e => {
							const newId = s ? e.get("id") : Entity.newId();
							idMap[e.get("id")] = newId;
							return new Entity[t](s ? e : e.set("id", newId).delete("userId"));
						};

						const result = e.has(t) ? e.get(t).sortBy((_, k) => +k).map(e => createEntity(e)) : new Immutable.Map();
						(!("_id_map" in c)) && (c["_id_map"] = new Immutable.Map());
						c["_id_map"] = c["_id_map"].set(t, new Immutable.fromJS(idMap));

						// --- SPECIAL CASE ---
						if (t === "mLearningObjective") {
							c["learningObjectiveAssoc"] = Immutable.fromJS(idMap);
						}
						// --- END SPECIAL CASE ---

						return result;
				}, type, changes, (c) => {
						const oldlk = this.layoutGetSaveKey(source);
						const newlk = this.layoutGetSaveKey(c);
						this.stateCopyPersistentStorage(localStorage, oldlk, newlk);
						this.stateCopyPersistentStorage(localStorage, oldlk+'.modelLS', newlk+'.modelLS');
				}, (m) => m.remove('originId'), null, alertCopy);

				return mc;
			} catch(e) {
				if (alertCopy.id < 0) {
					this.showDialog(Confirmation, {
						okText: "Reload",
						cancelText: " ",
						message: String(e.message || e),
						action: () => window.location.reload()
					});
					return null;
				}
				console.error(`Could not copy model: `, e);
				this.showDialog(Message, { message: `Could not copy model: ${e.message || e}` });
				return null;
			}
		}

    async modelCopyCurrent(){
        const model = this.modelGetPath(this.state.detail);
        if(model){
            const modelName = Application.defNameCopy(this.Model, model.top, true);
            const domainType = Application.domain === "teaching" && model.top.type === "learning" ? "learning" : "research";
            const m = await this.modelCopy(modelName, model.top, domainType);
						// if (Application.isResearch) {
						// 	this.showDialog(Message, {message: "Copying model..."});
						// 	setTimeout(() => window.location.reload(), 3000);
						// }
            return m;
        }
		}

    modelDownload(type, e, _) {
        if(e === undefined)
            {e = this.modelGetPath(this.state.detail);}
        if (_.shiftKey) {
            type === "EXPR" && Utils.downloadBinary(e.name + ".txt", new Blob([Seq(e.Component).filter(e => e.isExternal).map(e => '"' + e.name + '"').sortBy(e => e.toLowerCase()).concat(
                e.expressions((_, e) => (e.isExternal ? "e" : "i") + "[" + e.id + "]").map((v, k) => (v = v.replace(/[ce]/g, "").replace(/i/g, "*"),
                Seq((k = e.Component[k]).inputs).forEach((e, k) => v = v.replace(new RegExp("\\[" + k + "]", "g"), '"' + e.name + '"')), '"' + k.name + '" = ' + (v || false)))).join("\r\n")], { type: "application/text" }));
        } else {
					if (e.top.Persisted < 1) {
						this.showDialog(Message, { message: `Please ensure the model is saved before downloading` });
						return;
					}
					let downloadUrl = `api/model/${e.top.Persisted}/export/version/${e.Persisted}?type=${type}&modeltype=${e.modelType}`;
					//this.modelExecute(e, this.download.bind(this, downloadUrl, this.nameModelDownload(e, type), type));
          this.modelExecute(e, this.download.bind(this), downloadUrl, this.nameModelDownload(e, type), type);
        }
		}

    nameModelDownload(e, type) {
			const extension = ModelType[e.modelType].exportTypes[type].defaultExtension;
			return `${e.top.name} (${type})${extension}`;
		}

    modelRemoveVersion (e){
        const data = {};

        const selected = this.modelGetPath(this.state.detail);
        const top = e.top;
        const changeVersion = top.sub().id === e.id;
        const M = this.state.Model.withMutations(c => {
            const id = top.id;
            e.delete(this, c);
            changeVersion && c.setIn([id, 'currentVersion'],
                Seq(top.all()).find(model=>model !== e).id
            );
        });
        top.set(M.get(top.id));
        top.remove(e);
				top.setRemovedVersion({version: e.id, name: e.name, id: top.id});
        selected === e && this.modelSelect(true, Seq(top.all()).find(e=>e!==selected));

        this.setState({
            Model: M
        });
		}

    async modelRemove(e, keepCurrent) {
        const data = {};

        if(e instanceof ModelEntity) e = Seq([e]);
				e = e.map( e => ((e instanceof ModelVersion) ? e.top : e) );

        const moduleIds = e.map(e=>e.top.id).toArray();

        const M = this.state.Model.withMutations(c => {
            e.forEach(e => {
                Seq(e.all()).forEach( v => {
                    v.isPersisted && (data[v.persistedPath.join("/")] = v);
                });
                e.delete(this, c);
            });
        });

				let errorMsg = 'Model not selected';
				if (!Seq(data).isEmpty()) {
					try {
						await new Promise((rslv, rjct) => {
							this.ajax(`api/model/${moduleIds.map(id => `${id}`).join(",")}`,
							{...Seq(data).map(e=>({modelType: e.modelType})).toObject()}, () => {
								Seq(data).forEach((e) => delete this.Persisted[e.top.id] );
								rslv();
							}, (error) => rjct(error), null, null, null, { requestMethod: "DELETE" });
						});
						e.forEach(e => {
					    delete this.Workspace[e.id];
					    delete this.Workspace[e.originId];
						});
						this.setState({
								Model: M
						});
						!keepCurrent && this.setState({
								master: undefined,
								detail: undefined
						});
						ModelEvents.emitEvent('modelRemove', [{ids: moduleIds}]);
						this.props.modelsRemove(moduleIds);
						errorMsg = undefined;
					} catch(error) {
						const jsonRes = errorResponse(error);
						errorMsg = jsonRes.message;
					}
				}

				if (errorMsg) {
					this.showDialog(Message, { message: `Unable to remove Model: ${errorMsg}` });
				}
		}

    modelPublish(e, value = {published: false, modelType: 'boolean'}) {
        const versions = Object.values(e.top.all());
        //const data = {};
				const modelTop = versions[0];
				const modelId = parseInt(`${modelTop.persistedPath[0]}`);
				const postData = { ...value, modelType: modelTop.modelType };

				this.ajax(`api/model/${modelId}/publish`, postData, () => {
					for (const v of versions) {
						this.modelExecute(v, () => {
								let _published = value.published;
								this.stateSet(v, ["isPublic"], v.top.isPublic = _published);
								// toggle edit access after publish
								this.stateSet(v, ["permissions"], v.top.permissions = {
									edit: !_published, delete: !_published, share: !_published, publish: true
								});
						});
					}
				});
    }

		modelAfterSaved(resData) {
			const doPageUpdate = new Map();
			doPageUpdate.set("Annotation", resData);
			this["doPageUpdate"] = doPageUpdate;
		}

    modelSave(action, cbk, isMyTeaching, actionType) {
			const { currLesson } = this.props;

			const waitForSave = () => {
			return new Promise((resolve, reject) => {
				!action && this.loggerAdd("Model", "save");
				!action && this.loggerStore("WEB::MODEL", "UPDATE", 0, "modelMixin.js");

				const persistedEntities = Seq(this.entities).filter(e => e.source && !e.isShared).filterNot(e => e.source.isSelf).cacheResult();

				const persistedProperties = (t, v) => {
					if (!Entity[t]) { return Seq([]) }
					return Seq(Entity[t].prototype.properties).keySeq().filterNot(k => v && (k = v[k]) && !k.to).cacheResult();
				}

				// const isIndexIterable = (obj) => {
				// 	return obj['@@__IMMUTABLE_ORDERED__@@'] && obj['@@__IMMUTABLE_INDEXED__@@'] && obj['@@__IMMUTABLE_SEQ__@@'] && obj['@@__IMMUTABLE_ITERABLE__@@']
				// }
				const isImmutableOrderedMap = (thing) => {
					return Boolean(thing instanceof Object && thing['@@__IMMUTABLE_ORDERED__@@'] && !thing.hasOwnProperty('__hash'));
			  }
				const isImmutableMap = (thing) => {
					return Boolean(thing instanceof Object && thing['@@__IMMUTABLE_MAP__@@']);
			  }
				
				const getEntityValue  = (entity, property) => {
					const isImmutableMapObj = isImmutableOrderedMap(entity) || isImmutableMap(entity);
					return entity && typeof isImmutableMapObj ? entity.self.get(property) || entity[property] : entity[property];
				}
				const dirty = (curE, e, fUpdate) => {
					//pp: current data; e: newer data; p: property
					return function(pp, p) {
						if (fUpdate && fUpdate(p) && (pp[p] != undefined || pp[p] != null)) {
							return true;
						};
						return getEntityValue(e, p) !== (pp ? getEntityValue(pp, p) : undefined);
					}.bind(this, e.isPersisted && curE && curE[e.id]);
				}

				const get = (p, e, f, m) => {
					// compartmentId
					const v = getEntityValue(e, p);
					let k, r = e[p] != undefined ? (p.length >= 2 && p.indexOf("Id") === p.length - 2 && e.sources[k = p.substring(0, p.length - 2)] ? e[k] && e[k].Persisted : (f && (f = f[p]) && (f = f.to) ? (typeof(f) == "function" ? f(e[p], m) : f[e[p]]) : v)) : null;
					e.properties[p] && (r = ((e.properties[p] || {}).toRaw || (e=>e))(r) );
					return r;
				};
				const entities  = this.state.Model;
				const current   = this.Model;
				const persisted = this.Persisted;
				let map = Application.properties.ModelVersion.to;
				const values = Application.values.Model;
				let properties = persistedProperties("ModelVersion", values);
				const models = {};

				const renameParentProps = (entK, entV, currInstance, mapper) => {
					if (entK == "Page" && entV.source === "pageMap") {
						Seq(currInstance).forEach(v => {
							switch (v.parent && v.parent.constructor.name) {
								case 'Gene': mapper.parentId = 'geneId'; break;
								case 'Reaction': mapper.parentId = 'reactionId'; break;
								case 'Metabolite': mapper.parentId = 'metaboliteId'; break;
								default:;
							}
						})
					}
				}
				const addEntity = (result, removed, inner, m, pmodel, all) => ((e,k) => {
						const _current = m["_" + k];
						const current = m[k];
						if (current === undefined) { return }
						const pp = m.isPersisted && pmodel && pmodel[k];
						const map = this.properties[k].to;
						const values = Application.values[k];
						const properties = persistedProperties(k, values);
						const tMap = k;
						(result.modelType === "metabolic") && (renameParentProps(tMap, e, current, map));
						let s = Seq(current).filter(e => all || e.isDirty(pp, inner)).mapEntries(([k, v]) => {
								const fUpdate = filterForceUpdate(new Array(['LearningActivityGroup', ['position']], ['LearningActivity', ['position']]), tMap);
								const d = new Immutable.Map(properties.filter(dirty(pp,v, fUpdate)).map(p => [map[p] || p, get(p, v, values, m)]));
								return [v.Persisted, v.inner ? d.concat(Seq(v.inner).filter(e => inner[e].has(k)).mapEntries(([k, e]) => [map[k] || k, (e = v[k]) ? values[k].to(e) : null])) : d];
						}).filter( m.isPersisted && pmodel ? (e => e.size) : (_=>true)).map(e => e.toObject());
						pp && !all && (s = s.concat(Seq(removed[k] = Seq(pp).filterNot(e => current[e.id]).toObject()).mapEntries(([k, v]) => [_current[v.id].Persisted, null])));
						s.cacheResult().size && (result[e.source] = (result[e.source] ? s.concat(result[e.source]) : s).toObject());
				});

				const cbPersistedEntity = (mType) => (e) => !e.global && (!e.types || e.types.includes(mType));

				const data = Seq(current).map(e=>
					Seq(e.all()).filter((v) => {
							let enabledEdit = isEditEnabled(v);
							return (!v.isPersisted || !this.modelGetPath(v.path, persisted, true) || entities.getIn(v.path) !== this.modelGetPath(v.path, persisted, true).self) && enabledEdit
						}).mapEntries(([_, m]) => {
								let result = { modelType: m.modelType }, removed = {}
								const pmodel = this.modelGetPath(m.path, persisted, true);
								properties.filter(dirty(m.isPersisted && pmodel.ModelVersion, m)).forEach(p => {
									result[map[p] || p] = get(p, m)
								});

//                properties.filter(dirty(m.isPersisted && pmodel.Model, m)).forEach(p => { result[map[p] || p] = get(p, m) });

								const inner = Seq(Application.entities).filterNot(e => e.source).map((_, k) => {
										const current = m[k];
										const pp = m.isPersisted ? pmodel[k] : null;
										return Seq(current).filter(e => e.isDirty(pp)).concat(removed[k] = Seq(pp).filterNot(e => current[e.id]).toObject()).map(e => e.parentId).toSet();
								}).toObject();

								persistedEntities.filter(cbPersistedEntity(result.modelType)).forEach(addEntity(result, removed, inner, m, pmodel, false));

								const version = m.Persisted;
								const id = m.parent.Persisted;
								const savePath = id+'/'+version;

								const versionDefProps = Entity.ModelVersionDef.prototype.properties;
								const verdef = {};
								Seq(versionDefProps).filter((_,p) => result[p]).forEach( (_,p)=> {
										verdef[p] = result[p];
										delete result[p];
								});
								if(Seq(verdef).size){
										result.modelVersionMap = Seq(m.top.all()).mapEntries(([_,v]) => [v.Persisted, {}]).toObject();
										result.modelVersionMap[m.Persisted] = verdef;
								}

								/** Quick Fix needs more investigation work */
								if (result) {
										result.score && (delete result.score);
								}

								Seq(result).size ? (models[savePath] = { self: m, inner: inner } ) : (pmodel.set(m.self), result = null);

								if (result) {
										Seq(Entity.Model.prototype.properties)
												.filter((_,k)=>!m.isPersisted || m.top.self.get(k) !== pmodel.top.self.get(k))
												.forEach((_,k) => {
														result[k] = m.top[k];
												});
										result.selected && (delete result.selected);

										const binsToFill = {};
										const binned = Seq(this.entities).filter(e=>e.bin).cacheResult();

										const allbins = binned.map(e=>e.bin).groupBy(e=>e).map(e=>e.first());
										binned.filter(e=>result[e.source]).forEach((e,k)=>{binsToFill[e.bin] = true;});
										binned.filter(e=>binsToFill[e.bin]).forEach(addEntity(result, removed, inner, m, pmodel, true));
										binned.filter(e=>result[e.source]).forEach((e)=>{(result[e.bin] || (result[e.bin] = {}))[e.source] = result[e.source]; delete result[e.source]});
										allbins.filter(bin=>result[bin]).forEach(bin=>{Seq(result[bin]).forEach(ent=>Seq(ent).filter(v=>v==null).forEach((_,k)=>{delete ent[k];}))});

										const parents = e => Seq(e.sources).map((v, k) => (k = e[k]) && k.targets[v] && !k.targets[v].nullable && k).filter(e => e).find((e, k) => ((k = removed[e.className]) && k[e.id]) || parents(e));
										persistedEntities.filter(cbPersistedEntity(result.modelType)).filter((_, k) => Seq(removed[k]).size && Seq(Entity[k].prototype.sources).size).forEach((v, k) => (v = result[v.source]) && Seq(removed[k]).forEach(e => parents(e) && delete v[e.Persisted]));
										persistedEntities.filter(cbPersistedEntity(result.modelType)).filter(e => (e = result[e.source]) && !Seq(e).size).forEach(e => delete result[e.source]);
										Seq(removed).forEach((v, k) => {
												const _current = m["_" + k];
												Seq(v).forEach((_, k) => _current[k].Persisted = Entity.newId());
										});

										const p = pmodel || {};
										(m.numNodes = m.nodes.count()) !== p.numNodes && (result.components = m.numNodes);
										(m.numEdges = m.edges.count()) !== p.numEdges && (result.interactions = m.numEdges);

										result.currentVersion && (delete result.currentVersion);

										!m.isPersisted && Seq(['userId', 'type']).forEach(k => {result[k] = m.parent.self.get(k)});
										
										result._originId =  id;
										if (!result.userId) {
											result.userId = m.userId;
										}
										result.originId && (result.originId = m.self.get("originId"));
										(Application.isLearning) && (result.startLesson = true);
								}

								return [savePath, result];
						}).filter(e => e)
				)
				.concat(
						Seq(persisted).map(e=>Seq(e.all()).filterNot(e => this.modelGetPath(e.path, current, true) )
								.mapEntries(([_, v]) => {
										const k = v.top.Persisted+"/"+v.Persisted;
										models[k] = {self: v, delete: true};
										return [k, null];
									})
						))
				.flatten(true).toObject();

				properties = persistedProperties("Model", values);

				map = Application.properties.Model.to;
				Seq( current ).filter( m => !persisted[m.id] || (entities.getIn(m.path)!== persisted[m.id].self && isEditEnabled(m)) ).forEach((m) => {
					const inner = Seq();
					const result = { modelType: m.modelType }, resGlob = {}, removed = {};
					const pmodel = persisted[m.id];

					properties.filter(dirty(persisted, m)).forEach(p => { result[map[p] || p] = get(p, m) });

					persistedEntities.filter(e=>e.global).forEach( addEntity(resGlob, removed, inner, m, pmodel, false, true) );
					persistedEntities.filter(e=>e.global).forEach((entityDef,entityName) => {
							Seq(m[entityName])
								.filter(  (entity, entityId) => resGlob[entityDef.source] && resGlob[entityDef.source][entity.Persisted] !== undefined )
								.forEach( (entity, entityId) => {
									const persistedId = m.top.Persisted;

									let entityData = resGlob[entityDef.source][entity.Persisted];
									if(entityData.version)
										{delete entityData.version;}

									let storeVersion = m.all()[entity.version];
									if(!storeVersion){
										storeVersion = Seq(m.all()).last();
										if(entityName === "LearningActivity")
												{entityData = null;}
									}

									const persistedVersion = storeVersion.Persisted;
									// Building version with ID and version key: 99999/9
									const saveKey = [persistedId, persistedVersion].join('/');
									if(!data[saveKey])
											{data[saveKey] = {};}
									if(!data[saveKey][entityDef.source])
											{data[saveKey][entityDef.source] = {};}

									data[saveKey][entityDef.source][entity.Persisted] = entityData;

									if(!models[saveKey]){
										models[saveKey] = {};
										models[saveKey].self = storeVersion;
									}
								});
					});

					const toErase = Seq(resGlob)
						.map((e)=>Seq(e).filter(e=>e==null).toObject())
						.filter(e=>Seq(e).size)
						.toObject();
					if(Seq(toErase).size){
						const storeVersion = Seq(m.all()).last();

						const persistedId = m.top.Persisted;
						const saveKey = [persistedId, storeVersion.Persited || storeVersion.id].join('/');

						if(!data[saveKey])
								{data[saveKey] = {};}

						Seq(toErase).forEach((e,k)=>{
								data[saveKey][k] = Seq(data[saveKey][k] || {}).concat(e).toObject();
						});

						if(!models[saveKey]){
								models[saveKey] = {};
								models[saveKey].self = storeVersion;
						}
					}

					result.currentVersion && (delete result.currentVersion);

					if( Seq(result).size ) {
						Seq(m.all()).forEach(mod=>{
							const savePath = mod.persistedPath.join('/');
							(models[savePath] || (models[savePath] = {})).self = mod;
							data[savePath] = {...(data[savePath] || {}), ...result};
							data[savePath].selected && (delete data[savePath].selected);

							if(result.selected){
								let d = data[savePath].modelVersionMap || (data[savePath].modelVersionMap = {});
								d = (d[mod.Persisted] || (d[mod.Persisted] = {}));
								d.selected = mod.Persisted === result.selected.Persisted;
							}
						});
						data["removeVersions"] = m.top.removedVersions();
					}

					result.modelType = m.modelType;
/*          if( Seq(resGlob).size ) {
						let mod = Seq(m.all()).last();
						let savePath = mod.persistedPath.join('/');
						(models[savePath] || (models[savePath] = {})).self = mod;
					}
*/
				});

				const done = () => {
						cbk && cbk();
						resolve();
						this.setState({ saving: false });
				};
				if (Seq(data).count()) {
						this.setState({ saving: true });
						(currLesson.type && currLesson.id === null) && (actionType = currLesson.type);
						let i = 0;
						const positions = {};
						Seq(data).filter((_, _k) => data[_k]).forEach((_, _k) => {
							positions[_k] = i;
							let _path = _k.split('/');
							// Remove other versions if the current version is being created
							if (Number(_path[0]) > 0) {
								Seq(data).filter((_, _k2) => data[_k2]).forEach((_, _k2) => {
									let _path2 = _k2.split('/');
									if (Number(_path2[0]) < 0 || _path2[0].originId == _path[0]) {
										console.log(`For ${_path2[0]} deleting ${_k}`);
										delete data[_k];
									}
								});
							}
							// Remove all versions that do not match the last version found in the data queue
							const lastKey = Object.keys(data).at(-1);
							if (lastKey.indexOf('/') > 0) {
								const lastPattern = lastKey.split('/')[0];
								Object.keys(data).forEach(key => {
										if (!key.startsWith(`${lastPattern}/`)) {
												delete data[key];
												console.log(`Deleting module ${data[key]}`);
										}
								});
							}

							if (data[_k]) {
								// Informing the server to save this lesson instead of the original one
								if (currLesson && currLesson.id && currLesson.originId == parseInt(_path[0])) {
									console.log("Setting the current lesson ", currLesson.id,' from ', currLesson.originId);
									data[_k].currentLesson = {
										lessonId: Number(currLesson.id),
										originId: Number(currLesson.originId),
										versionId: currLesson.versionId,
										version: currLesson.version,
									}
									// Activities for learning will not be edited from the "My Learning" section
									if (Application.isLearning && 'learningActivityMap' in data[_k]) {
										delete data[_k].learningActivityMap;
									}
								}
								// Remove all unnecessary properties
								if ('permissionsMap' in data[_k]) {
									delete data[_k].permissionsMap;
								}
								if ('_originId' in data[_k]) {
									delete data[_k]._originId;
								}
								if ('userId' in data[_k]) {
									delete data[_k].userId;
								}

								// Remove nodes with null x,y if their componentId already has a valid position
								if ("layoutNodeMap" in data[_k]) {
									const nodeMap = data[_k].layoutNodeMap;
									const validComponentIds = new Set(
										Object.values(nodeMap)
											.filter(node => node.x !== null && node.y !== null)
											.map(node => node.componentId)
									);
									for (const key in nodeMap) {
										const node = nodeMap[key];
										if (node.x === null && node.y === null && validComponentIds.has(node.componentId)) {
											delete nodeMap[key];
										}
									}
								}
							}
						});
						let pathUri = "api/model?add=new";
						if ([APP_START_LESSON, APP_RESTART_LESSON].includes(actionType)) {
							pathUri +="&type=start_lesson&action="+actionType;
						}
						this.course && (pathUri += `&course=${this.course}`);
						this.ajax(pathUri, data, e => {
								const ids = persistedEntities.filter(e => e.source.indexOf("metadata" /* NOTE: -1 is a truthy value, 0 is a falsy value */))
																					.mapEntries(([k, v]) => [v.source.replace(/Map$/, "Ids"), k])
																					.toObject();

								const { data } = e
								const versionIds = [];

								Seq(data).sortBy((_,k)=>positions[k]).forEach(async (v, k) => {
										const model = models[k];
										if (!model) return; // non-model keys
										const m = model.self || Seq(model.top.all()).first();
										const path = m.path;
										const id = path[0];
										const version = m.currentVersion;
										const oldlk = this.layoutGetSaveKey(m);
										const entities = this.state.Model.getIn(path);
										const p = new ModelVersion(entities);
										const pm = this.modelGetPath(path, this.Persisted);
										pm && (p.workspaceLayout = pm.workspaceLayout);
										if(!this.Persisted[id]){
											this.Persisted[id] = new Model(m.top.self);
										}else{
											if(this.Persisted[id].self === this.Model[id].self){
												this.Persisted[id].self = m.top.self;
											}
										}
										this.Persisted[id].add(p);
										this.Persisted[id].user = this.state.user;
										const mapper = e => Seq(e).filter((v, k) => v.Persisted < 0 && v.Persisted !== k).mapEntries(([k, v]) => [v.Persisted, k]);
										const update = (m, e, p, v, k) => {
												let id = m[k];
												id === undefined && (id = k);
												e[id].Persisted = p[id].Persisted = v;
										};

										const addPersEntity = (m, p, _, k) => p[k] = Seq(m[k]).map((e, n) => ((n = new Entity[k](e.self)).Persisted = e.Persisted, n)).toObject();
										Seq(this.entities).filterNot(e=>e.global).forEach(addPersEntity.bind(null,m,p));
										Seq(this.entities).filter(e=>e.global).forEach(addPersEntity.bind(null,m.top,p.top));

										let _currVersionId = v.id;

										// Select the minor version ID
										if (m.modelType) {
											if (m.modelType == 'boolean') {
												if (id < 0) {
													versionIds.push(_currVersionId);
													_currVersionId = Math.min(...versionIds);
												} else {
													_currVersionId = m.top._id;
												}
											}
											else if (!m.top._id && v.id) {
												_currVersionId = v.id;
											}
											else {
												_currVersionId = m.top._id;
											}
										}

										if (m.Persisted < 0) {
												m.Persisted = p.Persisted = v.currentVersion;
												(isMyTeaching === true) && this.Workspace[k] === undefined && this.ajax("_api/model/edu/add/" + _currVersionId+"?version="+v.currentVersion);
										}
										if (m.top.Persisted < 0) {
												m.top.Persisted = p.top.Persisted = _currVersionId;
												(isMyTeaching === true) && this.Workspace[k] === undefined && this.ajax("_api/model/edu/add/" + _currVersionId+"?version="+v.currentVersion);
										}
										p.Persisted = m.Persisted;
										p.top.Persisted = m.top.Persisted = _currVersionId;

										Seq(v).filter((_, k) => ids[k]).forEach((v, k) => {
												const type = ids[k];
												const global = this.entities[type].global;
												const m2 = global ? m.top : m;
												const p2 = global ? p.top : p;
												const e = m2[type];
												Seq(v).filter((_, k) => k < 0).forEach(update.bind(null, mapper(e).toObject(), e, p2[type]));
										});

										const o = data[k];
										const d = this.MetadataDefinition;
										let IDMap = new Immutable.Map();
										const toSave = [];
										const metadata = t => {
												const key = t.replace(/Map$/, "Ids");
												const s = o[key];
												const map = persistedEntities.filter(e => e.source === t).map((_, k) => mapper(m[k])).flatten(true).toObject();
												Seq(v[key]).filter((_, k) => k < 0).forEach((v, k) => {
														const definitionId = Seq(d).findEntry((dv, dk) => {
															return Seq(m[dv.className]).find((_, mk) => k === mk) ? true : false;
														})[0];
														const type = d[definitionId].className;
														if (!toSave.includes(type)) toSave.push(type);
														(!IDMap.has(type)) && (IDMap = IDMap.set(type, new Immutable.Map()));
														IDMap = IDMap.setIn([type, k], v);
														update(map, m[type], p[type], v, k);
												});
										};

										o.metadataRangeIds && metadata("metadataRangeMap");
										o.metadataValueIds && metadata("metadataValueMap");

										m["_id_map"] = IDMap;
										p["_id_map"] = IDMap;
										this._syncEntityLinks(m);
										this._syncEntityLinks(p);

										const flattenedIDMap = {};
										IDMap.forEach(v => {
											v.keySeq().forEach(k => {
												const savedId = v.get(k);
												flattenedIDMap[k] = savedId;
											});
										});

										if (o.metadataRangeIds || o.metadataValueIds) {
											// do a quick metadata save, no need to call modelSave, just a single API request
											const modelKey = `${_currVersionId}/${v.currentVersion}`;
											// TODO - need to convert th
											let saveData = Immutable.fromJS({
												[modelKey]: Seq(toSave).toKeyedSeq().mapEntries(([_, v]) => [v, new Immutable.Map(p[v]).mapEntries(([_, ent]) => {
													const obj = ent.self.toObject();
													obj.id = ent.Persisted;
													return [obj.id, obj];
												}).set("_meta_class", v).toObject()]).reduce((accumulator, cur) => {

													let map = "metadataValueMap";
													// --- SPECIAL CASE ---
													if (["mTargetAudience", "mLearningType"].includes(cur["_meta_class"])) {
														map = "metadataRangeMap";
														Seq(cur).filterNot((_, k) => k === "_meta_class").forEach((v, k) => {
															if (!/^[0-9]+$/.test(k)) {
																const ent = v;
																delete cur[k];
																delete ent['id'];

																cur[Entity.newId()] = ent;
															}
														});
													}
													// --- END SPECIAL CASE ---

													return accumulator.set(map, (accumulator.get(map) || new Immutable.Map()).concat(new Immutable.Map(cur)
														.filter((value, key) => key !== "_meta_class")
														.toObject()))
												}, new Immutable.Map()).toJS()
											});

											if (m["learningObjectiveAssoc"]) {
												let loassoc = saveData.has("learningObjectiveAssoc") ? saveData.get("learningObjectiveAssoc") : new Immutable.Map();
												if (loassoc) {
													let lomap = new Immutable.Map(m["learningObjectiveAssoc"]);
													lomap = lomap.mapEntries(([k, v]) => [k, flattenedIDMap[v]]);
													loassoc = loassoc.merge(lomap);
												}
												saveData = saveData.set("learningObjectiveAssoc", loassoc);
											}

											const self = obj => {
												return obj ? Seq(obj).map(item => item.self) : Seq({});
											}

											// TODO - have to update the entity IDs in this request :/
											// TODO - save all entity fields affected by entity links
											saveData = saveData.setIn([modelKey, "modelType"], "boolean").setIn([modelKey, "survey"], new Immutable.Map({
												surveyMap: self(p.Survey),
												surveyQuestionMap: self(p.SurveyQuestion),
												surveyQuestionOptionMap: self(p.SurveyQuestionOption),
												surveyTableCellMap: self(p.SurveyTableCell),
												surveyQuestionTextMap: self(p.SurveyQuestionText)
											}));
											saveData.getIn([modelKey, "metadataValueMap"]).keySeq().forEach(key => {
												const path = [modelKey, "metadataValueMap", key];
												saveData = saveData.setIn(path, saveData.getIn(path).delete("id").set("definitionId", saveData.getIn(path).get("definitionId").toString()));
											});

											if (![APP_START_LESSON, APP_RESTART_LESSON].includes(actionType)) {
												pathUri +="&type=start_lesson&action="+actionType;
												if (saveData.hasIn([modelKey, "survey"])) {
													saveData = saveData.deleteIn([modelKey, "survey"]);
												}												
												saveData = saveData.toJS();
												await cc.request.post('/api/model?metadata=true', saveData, {
													headers: {
														'x-auth-token': this.state.user.token
													}
												});
											}
										}

						Seq(model.inner).filter(e => e.size).forEach((_, k) => Seq(m[k]).filter(e => e.Persisted < 0).forEach(e => e.Persisted = 0));
						p.numNodes = m.numNodes;
						p.numEdges = m.numEdges;
						p.modelType = m.modelType;
						p.build(this);
						p.top && p.top.build(this);
						const savedModelId = _currVersionId || id;
						ModelEvents.emitEvent('modelSaved', [{ id: savedModelId }]);
						this.modelAfterSaved(v);
						const newlk = this.layoutGetSaveKey(m);
						this.stateCopyPersistentStorage(localStorage, oldlk, newlk);
						this.stateCopyPersistentStorage(localStorage, oldlk + '.modelLS', newlk + '.modelLS');
						if (this.state.detail + "" == m.path + "") this.routerGoTo(m, "replace");
					});

								Seq(models).filter(e=>e.delete).map(e=>e.self).forEach( m => {
									const {top:{id}} = m;
									persisted[id].remove(m);
									if(persisted[id].self === current[id].self){
										persisted[id].self = this.state.Model.getIn(m.path);
									}
								} );

								Seq(data).forEach((v, k) => {
										const model = models[k];
										if (!model) return;
										const m = (model.self && model.self.top) || model.top;
										this.Persisted[m.id].self = this.state.Model.getIn(m.path);
								});

								action && action(data);
								done();
						}, (data) => {
								done();
								let code, message;
								try {
									const jsonRes = errorResponse(data);
									code = jsonRes.code;
									message = jsonRes.message;
								} catch (e) {
									// default error emssage
									message = e.toString();
								}
								if (code == 401) {
									const SignIn = require("./dialog/signIn/index");
									this.showDialog(SignIn.default, {
											currType: 'RECONNECT', currMessage: "Sorry, your session has expired! Please Sign In again.",
											currUser: this.state.user,
											action: this.userSignIn.bind(this)});
								} else {
									this.showDialog(Message, { message: 'Changes were not saved: ' + message});
								}
								reject();
						}, null, null, null, { requestMethod: "POST" });
				}
				else {
						action && action();
						done();
						resolve();
				}
			});
			}

			this.ajax("login-verifier", null, (userSession) => {
				if (userSession && userSession.logged == true) {
					waitForSave();
				} else {
					let fnShowDialog = (el) => {
						el.showDialog(Confirmation, {
							okText: "Okay",
							cancelText: "Cancel",
							cancelStyle: {right: 'inherit'},
							message: 'This page will be reloaded. '
											+'You can either log in from another tab or allow us to reload this page now. '
											+'Please note that any unsaved data will be lost. Do you want to proceed?',
							action: () => {
								setTimeout(() => el.userSignOut(el), 200);
							}
						});
					}
					this.showDialog(Confirmation, {
						okText: "Sign In",
						cancelText: "Cancel",
						cancelStyle: {right: 'inherit'},
						message: 'Sorry, your session has expired. Please sign in to continue.',
						action: () => {
							setTimeout(() => fnShowDialog(this), 500);
						}
					});
				}
			});
    }

    modelIsShareAndEditable({ id, permissions }) {
				let base = {permissions};
        return (Application.domain !== "teaching" || !this.Workspace[id] || this.Workspace[id].id) && (isEditEnabled(base) + permissions.share) || false;
    }

    modelIsEditable({ id, permissions }) {
				let base = {permissions};
        return (Application.domain !== "teaching" || !this.Workspace[id] || this.Workspace[id].id) && isEditEnabled(base) || false;
    }

    modelIsPublishable({id, permissions}){
        return (Application.domain !== "teaching" || !this.Workspace[id] || this.Workspace[id].id) && (permissions.publish) || false;
    }

    modelIsDirty(m) {
        const pers = m && this.Persisted[m.top.id];
        const models = pers ? Seq([pers]).concat(Seq(pers.all())) : Seq([]);
        return !this.state.saving && !( pers && models.every(m => m.self === this.state.Model.getIn(m.path)) );
	}

    modelExecute(e, action, downloadUrl, downloadNameFn, downloadType) {
        const exec = (e) => {
            // this.modelIsDirty(e) ? this.modelSave(action).then(() => {}) : action()
						if (this.modelIsDirty(e)) {
							this.modelSave(action).then(() => {});
						} else {
							if (downloadUrl) {
								this.showDialog(Message, { message: `Downloading ${downloadType} file...` });
								this.ajax(downloadUrl, null, (exportFileName) => {
									waitForPing(this.ajaxPromise.bind(this, `api/exports-status?ping=${exportFileName.ping}`, null), 5000, 1800000)
										.then(() => {
											action(`api/exports-status?ping=${exportFileName.ping}&download=true`, downloadNameFn, downloadType);
										}).catch((e) => {
											console.log("Error: ", e);
											this.showDialog(Message, { message: `Error downloading ${downloadType} file.` });
										});
								});
							} else {
								action();
							}							
						}
        };
        (!this.state[this.stateGetKey(e.path) || e.path]) ? this.modelGet(e).then(exec) :  exec(e);
    }

		/**
		 * Uses the category list from APP_MODEL_CATEGORIES
		 * @param {string} category
		 */
		setOpenedFromCategory(category) {
			this.openedFromCategory = category;
		}
} );
