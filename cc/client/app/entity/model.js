import Immutable, { Seq } from "immutable";
import ModelEntity from "./modelEntity";
import Entity from "./Entity";

export default class Model extends ModelEntity {
	_builded = false;

	delete(context, entities) {
		const id = this.id;
		entities.delete(id);
		this.deleted = true;
		delete context.Model[id];
	}

	get PersistedVersion() {
		return this._pVersion || this.currentVersion;
	}

	set PersistedVersion(id) {
		this._pVersion = id;
	}

	get isPersisted() {
		return super.isPersisted && !(this._pVersion < 0) && !(this._pVersion === undefined && this.PersistedVersion < 0);
	}

	get builded() {
		return this._builded;
	}

	resetCaches() {
		this.resetTopCache();
		Seq(this.nextVersions).concat(this.prevVersion || []).forEach(m => m._cachedTop && m.resetCaches());
	}

	build(g) {
		Seq(this.LearningActivity).forEach(e => {
			const group = this.LearningActivityGroup[e.groupId];
			if (group) {
				e.group = group;
				group.activities = e;
			}
		});
		this._builded = true;
	}

	get publisher() {
		let e;
		return this.author || ((e = this.user) ? ((e.firstName || "") + " " + (e.lastName || "")).trim() || e.email : "");
	}

	get version() {
		return this.currentVersion;
	}

	get nodes() {
		if (this.modelType === "pharmacokinetic") return Seq(this.PKCompartment);
		return Seq(this.Component);
	}

	get originId() {
		return this._originId !== undefined ? this._originId : this.self.get("originId");
	}

	set originId(v) {
		this._originId = v;
	}

	get edges() {
		if (this.modelType === "pharmacokinetic") {
			const edgeMap = {};
			const addEdge = (s, t) => {
				if (!t) return;
				if (!s) return;
				let m = {}
				if(t.id in edgeMap) {
				  	m = edgeMap[t.id];
				} 
				m[s.id] = {source: s.id, target: t, type:true }
				edgeMap[t.id] = m;
			}
			Seq(this.Rate).forEach(e => addEdge( e.fromCompartment, e.toCompartment));
			return Seq(edgeMap).map(e => Seq(e).valueSeq()).valueSeq().flatten(true);
		}

		const map = Seq(this.Component).filter(e => e.upStreams).map(() => ({})).toObject();
		const add = (s, t, type) => {
			const m = map[t.id];
			const e = m[s];
			e ? e.type !== type && (e.type = 2) : (m[s] = { source: s, target: t, type: type });
		};

		Seq(this.Regulator).filter(e => e.type).forEach(e => add(e.componentId, e.parent, true));
		Seq(this.Regulator).filterNot(e => e.type).forEach(e => add(e.componentId, e.parent, false));
		Seq(this.ConditionSpecies).forEach(e => add(e.componentId, e.root, 2));
		Seq(this.SubConditionSpecies).forEach(e => add(e.componentId, e.root, 2));
		return Seq(map).map(e => Seq(e).valueSeq()).valueSeq().flatten(true);
	}

	resetTopCache() {
		this._cachedTop && (delete this._cachedTop);
	}

	get topVersion() {
		return this._cachedTop || (this._cachedTop = this.prevVersion ? this.prevVersion.topVersion : this);
	}

	get nextVersions() {
		return this._nextVersions;
	}

	get isLeaf() {
		return this.nextVersions.isEmpty();
	}

	get versionDef() {
		return Seq(this.ModelVersion).first();
	}

	expressions(f) {
		const internal = Seq(this.Component).filterNot(e => e.isExternal);
		const map = internal.map(e => e.expression(f.bind(null, e)).replace(/i\[/g, "c[")).toObject();
		const exp = (i, o, d) => {
			let result = new Immutable.OrderedMap();

			while (o.size) {
				o = o.map(e => e.filterNot(e => i.has(e)).cacheResult()).cacheResult();
				let s = o.filterNot(e => e.size).cacheResult();

				if (s.size) {
					o = o.filter(e => e.size).cacheResult();
					i = i.concat(s).toMap();
					result = result.concat(s.map((_, k) => map[k]));
				}
				else if (d) {
					s = o.map((e, k) => ({ v: e, k: (e = {}, e[k] = true, exp(i.concat(e).toMap(), o)).size })).cacheResult();
					const max = s.maxBy(e => e.k).k;
					s = s.filter(e => e.k === max).take(1).toMap();
					result = result.concat(s.map((v, e) => (e = map[e], v.v.forEach(k => e = e.replace(new RegExp("c\\[" + k + "]", "g"), "i[" + k + "]")), e)));
					o = o.filterNot((_, k) => s.has(k)).cacheResult();
					i = i.concat(s).toMap();
				}
				else break;
			}
			return result;
		};
		return exp(Seq(this.Component).filter(e => e.isExternal).toMap(), internal.map((p, e) => ((e = Seq(p.inputs).keySeq(), p = p.interactions) ? e.filterNot(k => p[k]) : e).cacheResult()).cacheResult(), true);
	}
}

Entity.init({ Model }, {
	name: null,
	userId: null,
	type: null,
	modelType: null,
	originId: { noAttach: true },
	description: { maxLength: 255 },
	currentVersion: null,
	creationDate: null,
	selected: null
});