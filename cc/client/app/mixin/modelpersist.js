import { Map } from "immutable";
import Persist from "./persist";


export default (properties, getLayoutConf, onLayoutViewChange = ()=>false, uniqk = null, defaults = null, versions = []) => {
	const getK = (k) => ( uniqk !== null ? ("["+uniqk+"]") : "") + k.replace(/[0-9]{4}\./g, "");
	return Persist(
		properties,
		(k, self, props, state) => (getLayoutConf(props || self.props, state || self.state) || new Map()).get(getK(k)),
		(k,v,self)              => ( onLayoutViewChange(self) && onLayoutViewChange(self)(getK(k), v), v),
		uniqk,
		defaults,
		versions
	);
};