import Immutable, { Seq, Map, Set } from "immutable";
import Utils from "../utils";
import Application from "../application";
import Views from "../views";
import Layouts from "../layouts";
import Update from "../action/update";
import layoutsMessages from "../layoutsMessages";

export default ( parent ) => ( class extends parent{

	translateLayoutKey(k){
		const {props:{intl}} = this;

		if ( typeof k == 'string' && k.startsWith("translate") ) {
			const key = k.split(":")[1].replace(/\./g, "");
			if ( layoutsMessages[key] ) {
				return intl.formatMessage(layoutsMessages[key]);
			}
		}

		return k;
	}

	UNSAFE_componentWillMount(...args) {
		super.UNSAFE_componentWillMount && super.UNSAFE_componentWillMount(...args);

		this.layoutSaveLazy = Utils.debounce(this.layoutChangeWorkspace, 100);

		const def = {
			width: "20%",
			height: "50%",
			minWidth: 210,
			minHeight: 100
		};

		this.View = Seq(Views).map(e => Seq(e).map(e => {
			const width = parseFloat(e.width || def.width);
			const height = parseFloat(e.height || def.height);

			return Seq(Utils.ext("name", e)).concat({
				width: width + "%",
				height: height + "%",
				minWidth: e.minWidth || def.minWidth,
				minHeight: e.minHeight || def.minHeight,
				left: e.left || (0.5*(100 - width) + "%"),
				top: e.top || (0.5*(100 - height) + "%")
			}).toObject();
		})).flatten(true).toObject();

		const merge = (r, d, t) => ((d = d[t]) ? Seq(r).map((v, k) => ((v = Seq(v), k = d[k]) ? (v = v.concat(k), t ? v.concat({ type: t }) : v) : v).toObject()).toObject() : r);

		const props = this.props
		const intl = props.intl

		const NewLayouts = Layouts;
/*		const NewLayouts = deepRenameKeys(Layouts, k => {
			if ( typeof k == 'string' && k.startsWith("translate") ) {
				const key = k.split(":")[1].replace(/\./g, "")
				if ( layoutsMessages[key] ) {
					return intl.formatMessage(layoutsMessages[key])
				}
			}

			return k
		})
*/

		const b = NewLayouts[null];
		const d = NewLayouts[Application.domain];
		this.Layout = Seq(Application.modelTypes).map((_, k) => merge(merge(merge(b[null], b, k), d, null), d, k)).concat({ undefined: merge(b[null], d, null) }).toObject();
		const mapIter = (e) => ((v,k) => {
			if(k === "views") {
				const val = Seq(v || { 0: {} }).map((v, k) => ({ key: k, type: e.type, views: v }));
				return val.toArray();
			}
			if(k === "layouts") return Seq(v).map(e => Seq(e).map(mapIter(e)).toObject()).toObject();
			return v;
		});

		this.Layout = Seq(this.Layout).map(e => Seq(e).map(e =>
			( e = Seq(e).map(mapIter(e)).toObject(), e.views || e.layouts ? e : undefined )
		).filter(e=>e).toObject()).toObject();
	}
	layoutGetSaveKey(m){
		return "modelLayout" + (m ? ("["+m.path+"]") : "");
	}
	layoutGetConfiguration(m, noSideEff, noLocals) {
		const r = (m && m.id) ? Seq(this.state.Layouts && this.state.Layouts.getIn(m.path)||{}).concat( noLocals ? {} : JSON.parse(this.stateGetPersistentStorage(localStorage, this.layoutGetSaveKey( m )) || "{}") ).toMap() : new Immutable.Map();
		!noSideEff && (this.curLayoutConf = r);
		return r;
	}
	_layoutRemoveCustomPanelsFromLayout(key, model, panelEntity){
//		all learning activities with current version containing this view key
		this.entityUpdate(Seq(model.top.LearningActivity).filter(learningActivity => {
			return learningActivity.views.has(key) && learningActivity.version == model.version;
		}).map(learningActivity => {
			return new Update(learningActivity, 'views', learningActivity.views.remove(key));
		}).toArray());
	}
	layoutGetValue(k){
		if(k && k.indexOf("Layout[Activities[") >= 0){
			const m = this.modelGetSelectedDetail();
			if(m){
				let e;
				k = k.replace(/^.*Layout\[Activities\[([^\]]+)\]\]/g, "");
				e = this._getLearningActivityEntity(this.state.layout);
				const wl = e && (e.workspaceLayout || e.__workspaceLayout);
				return wl ? wl.get(k) : undefined;
			}
		}
		return this.state.layoutConf.get(k);
	}
	_getLearningActivityEntity(layout){
		const m = this.modelGetSelectedDetail();
		let id;
		layout.replace(/Activities\[([0-9-]+)\]/g, (_, k)=>{id = k;});
		return m.top && m.top.LearningActivity[id];
	}
	layoutSetValue(k, v){
		const equalsWithoutHidden = (a, b) => {
			const removeHidden = (v) => Seq(v).filter((v, k) => !(/^__?/g.test(k))).toObject();
			return Utils.equals(removeHidden(a), removeHidden(b));
		}

		const m = this.modelGetSelectedDetail();
		if(!m) return;

		if(k && k.indexOf("Layout[Activities[") >= 0){
			k = k.replace(/^.*Layout\[Activities\[([^\]]+)\]\]/g, "");
			const e = this._getLearningActivityEntity(this.state.layout);
			if(!e) return;
			e.__workspaceLayout = (e.__workspaceLayout || e.workspaceLayout ||  new Immutable.Map()).set(k, v);
			this.entityUpdate([new Update(e, "workspaceLayout", e.__workspaceLayout)]);
			return;
		}

//		let s; //all the nodes bunch up on top of each other to the top left corner of the graph.
		if(!k || !this.curLayoutConf.has(k) || !equalsWithoutHidden(this.curLayoutConf.get(k), v)){
			if(k){ this.curLayoutConf = this.curLayoutConf.set(k, v); } else { this.curLayoutConf = Map(Seq(this.curLayoutConf)); }
			if(!this.curLayoutConf.has("_genWidth")) this.curLayoutConf = this.curLayoutConf.set("_genWidth", this.state.width);

			this.stateSetPersistentStorage(localStorage, this.layoutGetSaveKey(m), JSON.stringify( this.curLayoutConf.toJS() ));
			this.layoutSaveLazy(m, this.curLayoutConf);
		}
	}
	
	layoutDefault(m, l, { modelType = "boolean" } = { }) {
		/**
		 * This function attempts to decide which should be the default layout within the model dashboard
		 * @param m ModelVersion
		 * @parma l - layout name
		 */

		const mType = m.modelType || modelType;
		const modelLayout = `Model:${mType || "boolean"}`

		let e;

		return this.modelIsShareAndEditable(m) ? (!l || ((e = this.Layout[m.type][l]) && e.minAccess > m.permissions.share + 1) ? (
			m.type === "learning" ? (Application.isEducation ? "Overview" : "Description") : modelLayout) : l) : `Overview${m.type === "learning" ? "" : `:${mType}`}`;
	}

	layoutSection(e, s, u) {
		s && 
			!u && 
			this.Layout[undefined].Home.views[0].views.ModelsView.sections[s[0]].user && 
			(e.section = Application.domain == 'research' ? ["Published Models"] : ["Public Modules"]);
	}

	layoutGet(m, e, width) {
        if(m === undefined)
            {m = this.modelGetPath(this.state.detail);}

		let r = this.Layout[m.type][e];
		Seq(this.Layout[m.type]).forEach(l=>(r = r || Seq(l.layouts).get(e)));

		if (r) {
			const w = width || this.state.width;
			return Seq(r.views).findLast(e => e.key <= w);
		}else if(e.indexOf("Activities[") >= 0){
			const ae = this._getLearningActivityEntity(e);
			const a = {
				key: "0",
				type: undefined,
				views: ae ? ( ae.__views || ae.views || new Immutable.Set() ).map( e=>({
					height : "50%",
					left: "30%",
					top: "25%",
					width : "40%"
				}) ) : {}
			};
			return a;
		}
	}
	layoutGetViews(k, v) {
		if(k && k.indexOf("Activities[") >= 0){
			const e = this._getLearningActivityEntity(k);
			return (e && (e.__views || e.views)) || new Immutable.Set();
		}

		
		return this.state.layouts.getIn([v && v.type || "", k]) || Seq(v && v.views || {}).keySeq().toSet()
			.union( (this.state.layout && this.state.layout !== "Home" && this.state.globalViews) || new Set() );
	}
	layoutGetKey(k, v) {
		return ".Layout[" + ( k || "" ) + "]" + (v ? (v.type ? "[" + v.type + "]" : "") : "");
	}
	layoutSet(e) {
		this.loggerAdd("Layout", { action: "select", name: e });
		this.setState({ layout: e });
	}
	layoutAdd(e) {
		this.setState({
			layout: e,
			layouts: this.state.layouts.setIn(["", e], new Immutable.Set())
		});
	}

	layoutGetFavourites(m) {
		return Seq(Layouts[null][null])
			.filter(e => e)
			.filter(e => m && e.modelType == m.modelType)
			.filterNot(e => e.internal)
			.take(Application.maxFavorites)
			.keySeq()
			.toSet()
	}

	layoutGetInitState(m, noLocals){
		return {
			//    layout: m ? this.layoutDefault(this.modelGetSelectedDetail(m.path) || m) : "Model",
			layouts: new Immutable.Map({ "": new Immutable.Map()}),
			//TODO: metabolic
			favorites: this.layoutGetFavourites(m),
			layoutConf: this.layoutGetConfiguration(m, undefined, noLocals)
		};
	}
	layoutDeleteLocalPositions(m){
		this.setState({layoutConf: this.curLayoutConf = new Map()});
		this.stateDeletePersistentStorage(localStorage, this.layoutGetSaveKey( m ) );
		this.stateDeletePersistentStorage(localStorage, this.layoutGetSaveKey( m )+".modelLS" );
	}
	layoutRestore(d){
		let k, m = this.modelGetSelectedDetail(this.state, d);
		m && this.stateGetPersistentStorage(localStorage, (k = this.layoutGetSaveKey(m))) && ( this.stateDeletePersistentStorage(localStorage, k) );
		this.layoutGetConfiguration(m, undefined, true); //restore from model
		this.setState(this.layoutGetInitState( d ? m : undefined, d));  //force save
	}
	layoutRemove(e, _) {
		let {favorites, layouts, layout} = this.state;
		favorites = favorites.delete(e);
		this.setState({
			favorites: favorites,
			layouts: layouts.update("", v => v.delete(e)),
			layout: layout === e ? favorites.first() : layout
		});
		_.stopPropagation();
	}
	layoutToggle(e) {
		let f = this.state.favorites;
		this.setState({ favorites: f.has(e) ? f.delete(e) : ((f = f.add(e)).size > Application.maxFavorites ? f.rest() : f)});
	}
	viewAddCustom(m, t, add){
		this.viewToggle(m, t+"["+add()+"]", true);
	}
	viewRemoveCustom(m, t, del){
		this.viewToggle(m, t+"["+del()+"]", false);
	}
	viewToggle(m, e, to) {
		const toggle = (s) => ( s[(to !== undefined ? to : (!s.has(e)))?"add":"delete"](e) );
		if(this.View[e] && this.View[e].type === "separate"){
			this.setState({globalViews: toggle(this.state.globalViews) });
		}else{
			const layout = this.state.layout;
			if(layout.indexOf("Activities[") >= 0){
				const e = this._getLearningActivityEntity(layout);
				e.__views = toggle(e.__views || e.views ||  new Immutable.Set());
				this.entityUpdate([new Update(e, "views", e.__views)]);
				return;
			}

			const range = this.layoutGet(m, layout);
			const model = this.modelGetSelectedDetail();
			const views = this.layoutGetViews(layout, range, model);
			this.setState({ layouts: this.state.layouts.setIn([range && range.type || "", layout], toggle(views) ) });
		}
	}
	layoutIsValid(t, l){
		return !t || /^Custom/.test(l) || this.Layout[t || ""][l];
	}
	UNSAFE_componentWillUpdate(nextProps, nextState){
		const oldm = this.modelGetSelectedDetail(this.state), m = this.modelGetSelectedDetail(nextState);
		if( m && (oldm || {}).id !== m.id ) { this.layoutGetConfiguration(m); }
		if( m && this.state.layoutConf !== nextState.layoutConf ) {
			if(this._persisted.model = this.persistLoad.model(false, nextProps, nextState)){
				this._persisted.model.favorites && this._persisted.model.favorites.some((v) => !this.layoutIsValid(m.type, v)) && (this._persisted.model.favorites = this._persisted.model.favorites.filter(e=>this.layoutIsValid(m.type, e)).toSet());
				nextState.forceLayout && (this._persisted.model.layout = nextState.forceLayout, this.setState({forceLayout: null}));
				this.setState(this._persisted.model);
			}
		}
	}
	layoutChangeWorkspace(m, c, action){
		!action && this.loggerAdd("Layout", { action: "changeWorkspace", ws: c.toJS() });
		this.modelGetSelectedDetail() === m && !Utils.equals(c, this.state.layoutConf) && this.setState({layoutConf: c, Layouts: this.state.Layouts.setIn(m.path, c)});
	}
	layoutIsDirty(model){
		model = model.top;
		return !this.state.saving && model &&
                  Seq(model.all()).some(
										(m) => { m = this.modelGetPath(m.path,this.Persisted, true); return !m || m.workspaceLayout !== this.state.Layouts.getIn(m.path); }
                  );
	}
} );