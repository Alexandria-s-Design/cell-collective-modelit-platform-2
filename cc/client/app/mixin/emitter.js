import EventEmitter from "wolfy87-eventemitter";

export default (parent) => class extends parent{
	get emitter(){
		return this._emitter || (this._emitter = new EventEmitter());
	}
	addListener(type, a) {
		this.emitter.addListener(type, a);
	}
	removeListener(type, a) {
		this.emitter.removeListener(type, a);
	}
	emitEvent(type) {
		this.emitter.emitEvent(type);
	}
};