import Immutable, { Seq } from "immutable";
import Utils from "../utils";
import entityPrototype from "./entityPrototype";

const Entities = {};

export default class Entity {
	static init(type, properties, references, debug=false) {
		references = Seq(references).map(Utils.ext.bind(null, "nullable")).toObject();
		const name = Seq(type).keySeq().first();
		const prototype = (type = type[name]).prototype;

		function get(property, defaultVal) {
			return defaultVal !== undefined ? function() {
				return this.self.get(property) || defaultVal;
			} : function() {
				try {
					if (this.self === undefined) {
						this.self = Immutable.Map({name: ''});
					}
					return this.self.get(property, null);
				} catch(err) {
					console.error("Enity error:", property, err);
				}
			};
		}

		Seq(properties).filter( v => !v||!v.noAttach )
			.forEach((v, k) =>
				Object.defineProperty(prototype, k,
					(v && v.descriptor) || { get: get(k, v && v.defaultVal != undefined ? v.defaultVal : undefined) }
				)
			);

		function getRef(property) {
			return function() {
				return this[property];
			};
		}

		function setRef(property, key) {
			return function(e) {
				(this[property] || (this[property] = {}))[e[key]] = e;
			};
		}

		const ref = (e, k) => ({ get: getRef(e), set: setRef(e, k)});
		Seq(references).forEach((v, k) => Object.defineProperty(prototype, k, ref("_" + k, v.key || (v.key = "id"))));

		const sources = Seq(properties).filter(e => e && e.ref).mapEntries(([k, v]) => [k.substring(0, k.length - 2), v.ref]).cacheResult();
		const links   = Seq(properties).filter(e => e && e.link).mapEntries(([k, v]) => [k.substring(0, k.length - 2), v.link]).cacheResult();
		Object.defineProperty(prototype, "properties", { value: properties });
		Object.defineProperty(prototype, "targets", { value: references });
		Object.defineProperty(prototype, "sources", { value: sources.toObject() });
		Object.defineProperty(prototype, "links", { value: links.size ? links.toObject() : null });
		Object.defineProperty(prototype, "refs", { value: sources.mapEntries(([k, v]) => [v, k]).toObject() });
		Object.defineProperty(prototype, "className", { value: name });

		const inner = Seq(references).map(e => e.entity).filter(e => e).toObject();
		Seq(inner).size && Object.defineProperty(prototype, "inner", { value: inner });

		Entities[name] = Entity[name] = type;
	}

	toString(){
		return this.className+"["+this.id+"]";
	}

	static newId() {
		return (--Entity.id).toString();
	}

	static allocNewId(id) {
		Entity.id = Math.min(Entity.id, id);
		if(isNaN(Entity.id)){
			throw new Error();
		}
	}

	get top(){
		return this;
	}

	get uniqk(){
		return (this.path || this.id)+"";
	}

	constructor(self) {
		if(self instanceof Immutable.Map){
			//            this.__id = self.get('id');
			this.self = self;
		}else{
			this.create(self || {});
		}
	}

	/*    get id(){
        return this.__id;
    }
*/

	set(self, clear) {
		clear && Seq(this.targets).forEach((_, k) => delete this["_" + k]);
		//        this.__id = self.get('id');
		this.self = self;
		return this;
	}

	create(self) {
		if ( !self.id ) {
			self.id = Entity.newId();
		}
		const sources = Seq(this.sources).filter((_, k) => self[k]).cacheResult();
		sources.forEach((v, k) => {
			self[k + "Id"] = (this[k] = self[k]).id;
			delete self[k];
		});

		this.self = Seq(self).concat(Seq(this.properties).filter((v)=>v && v.fromRaw).filterNot((_,k)=>self[k]).map((v,k)=>v.fromRaw())).toMap();
		sources.forEach((v, k) => this[k][v] = this);

		if (this.parent) {
			let e = this.parent;
			let parentName, stop=false, i=0;
			while (e.parent && !stop) {
				parentName = entityPrototype(e.parent).getName();
				let arrayCombine = [entityPrototype(e).getName(), parentName];
				stop = (arrayCombine[0] === arrayCombine[1]);
				e = e.parent;
			}
			this.root = e;
		}
	}

	update(property, value) {
		const ref = this.sources[property];
		if (ref) {
			this.deleteRef(property, ref);
			this[property] = value;
			value && (value[ref] = this);
			this.self = this.self.set(property + "Id", value && value.id);
		}
		else {
			let e;
			this.self = this.self.set(property, value && (e = this.properties[property]) && (e = e.maxLength) ? value.substring(0, e) : value);
		}
		return this;
	}

	copy(p, targets, className) {
		return Seq([{ id: this.id, entity: p = new Entity[className || this.className](Seq(this.properties).filterNot(e => e && e.ref).map((_, k) => this.self.get(k)).filter(e => e != null).concat(
			Seq(this.sources).map((_, k) => this[k]).filter(e => e), p).toObject())}]).concat((targets ? Seq(targets) : Seq(this.targets).keySeq()).map(e => Seq(this[e]).map(e => e.copy({ parent: p })).flatten(true).valueSeq()).flatten(true));
	}

	get globalId() {
		return { id: this.id, className: this.className };
	}

	get isEmpty() {
		return false;
	}

	get Persisted() {
		return this._id === undefined ? this.id : this._id;
	}

	set Persisted(id) {
		this._id = id;
	}

	get isPersisted() {
		return !(this._id < 0) && !(this._id === undefined && this.id < 0);
	}

	isDirty(persisted, inner) {
		const id = this.id;
		return !this.isPersisted || !persisted || this.self !== persisted[id].self || (this.inner && Seq(this.inner).some(e => inner[e].has(id)));
	}

	deleteRef(property, ref) {
		const p = this[property];
		if (p) {
			const i = "_" + ref;
			p[i] && delete p[i][this[p.targets[ref].key]]; //p[i] just temp fix #2174
			!Seq(p[i]).size && delete p[i];
		}
	}

	delete(context, entities) {
		const id = this.id;
		const type = this.className;

		if (context[type][id]) {
			entities.deleteIn([type, id]);
			delete context[type][id];
			const seq = Seq(this.targets);
			seq.filterNot(e => e.nullable).forEach((_, k) => Seq(this[k]).forEach(e => e.delete(context, entities)));
			seq.filter(e => e.nullable).forEach((e, t) => Seq(this[t]).forEach((v, k) => {
				const p = e.property || v.refs[t];
				v[p] = null;
				v === context ? entities.delete(p + "Id") : entities.setIn([v.className, k], v.set(v.self.delete(p + "Id")).self);
			}));
			Seq(this.sources).forEach((v, k) => this.deleteRef(k, v));
			const parent = this.parent;
			parent && parent.isEmpty && parent.delete(context, entities);
		}
	}
}

Entity.id = 0;

Entity.init({ Entity }, {
	id: null,
	name: null,
	_createdAt: { defaultVal: new Date() },
	_createdBy: null,
	_updatedAt: { defaultVal: new Date() },
	_updatedBy: null
});

export {Entities};