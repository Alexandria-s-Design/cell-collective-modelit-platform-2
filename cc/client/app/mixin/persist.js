import Immutable, { Seq } from "immutable";
import Application from "../application";

const VERSION_KEY = '__v';

const Persist = (properties, stGet, stSet, uniqk = null, defaults = null, versions = [], versionLen = undefined) => (
	(parent) => class extends parent{
		getInitState(){
			const k = this.props.persist || "";
			const componentName = this.constructor.displayName;
			const id = "VERSION[" + Application.version + "]" + k + 
								(k.substring(k.length - 1) === "." ? componentName : "")+
								(uniqk ? ("." + uniqk) : "");

			(this.persistLoad || (this.persistLoad = {}))[uniqk] = (set, ...data) => {
				let o = stGet ? stGet(id, this, ...data) : (localStorage[id] ? JSON.parse(localStorage[id]) : undefined);
				if (o || defaults) {
					if (o) {
						const version = o[VERSION_KEY] || 0;

						const maxVersion = versionLen !== undefined ? versionLen : versions.length;
						for (let i = version; i < maxVersion; ++i) {
							o = versions[i](o, id);
							o[VERSION_KEY] = i;
						}
					}

					defaults && (o = Seq(defaults).concat(o || {}).toObject());

					properties && (o = Seq(properties).map((v, k) => (v ? (v.from || Persist[v].from)(o[k], this) : o[k])).toObject());
					set && o && this.setState(o);
					return o;
				}
			};
        
			const set = stSet || ((k,v) => {localStorage[k] = JSON.stringify(v); return v;});
			(this.persistSave || (this.persistSave = {}))[uniqk] = () => {
				const toSave = properties ? Seq(properties).map((v, k) => (v ? (v.to || Persist[v].to)(this.state[k], this) : this.state[k])).toObject() : this.state;
				return set(id, { 
								...toSave//, 
//								[VERSION_KEY]: versions.length
							}, this);
			}
        
			return super.getInitState ? super.getInitState() : {};
		}
		UNSAFE_componentWillMount(...args) {
			((this._persisted || (this._persisted = {}))[uniqk] = this.persistLoad[uniqk](true));
			super.UNSAFE_componentWillMount && super.UNSAFE_componentWillMount(...args);
		}
		componentDidMount(...args) {
			delete this._persisted[uniqk];
			super.componentDidMount && super.componentDidMount(...args);
		}
		componentDidUpdate(props, state) {
			Seq(properties || this.state).findKey((_, e) => state[e] !== this.state[e]) && this.persistSave[uniqk]();
			super.componentDidUpdate && super.componentDidUpdate(props, state); 
		}
	});

Persist.Map = { from: e => new Immutable.Map(e), to: e => e.toObject() };
Persist.Set = { from: e => new Immutable.Set(e), to: e => e.toArray() };

export default Persist;