import Entity from "./Entity";
import {Seq, Map} from "immutable";

export default class ModelEntity extends Entity {
	delete(context, entities) {
		entities.deleteIn(this.path);
		this.deleted = true;
		this.parent ? this.parent.remove(this.id) : delete context.Model[this.id];
	}

	build(g){
		Seq(this.all()).forEach(e => e.build(g));
	}

	add(version) {
		(this._sub || ( this._sub = {} ))[version.id] = version;
		version.parent = this;
	}

	sub(id, forced) {
		return this.all()[id] || (!forced && this.all()[this.currentVersion] || Seq(this.all()).first());
	}

	cur() {
		return this.sub();
	}

	set(e, d){
		super.set(e);
		this.parent && !d && this.parent.updateRec(this.id, this.self);
		return this;
	}

	remove({id}){
		delete this.all()[id];
	}

	all() {
		return this._sub || {};
	}

  setRemovedVersion(val) {
		if (!this._removedVersion) {
			this._removedVersion = [];
		}
		this._removedVersion.push(val);
		return this;
	}

	removedVersions() {
		return this._removedVersion;
	}

	fixSelf(Model){
		this.self = Model.getIn(this.path);
		//      this.parent && this.parent.fixSelf(Model);
	}

	updateRec(id, e){
		this.self = this.self.set(id, e);
		this.parent && this.parent.updateRec(this.id, this.self);
		return this;
	}

	get pathEl(){
		const p = [this];
		return this.parent ? this.parent.pathEl.concat(p) : p;
	}

	get persistedPath(){
		return this.pathEl.map(e=>e.Persisted);
	}

	get top(){  //return the topmost entity
		return this.parent ? this.parent.top : this;
	}

	get path(){
		return this.pathEl.map(e=>e.id);
	}
}