import { Seq } from "immutable";
import History from "../history";

export default (parent) => ( class extends parent{
	historyPush(s, path) {
		const m = this.modelGetPath(path);
		m.history && m.history.push({
			entities: this.state.Model.getIn(path),
			curLayoutConf: this.state.Layouts.getIn(path),
			layout: this.state.layout,
			selected: this.state[this.stateGetKey(s)].get("selected")
		});
	}
	historyMove(move) {
		this.loggerAdd("History", move);

		const path = this.state.detail;

		const model = this.modelGetPath(path);
		const entities = this.state.Model.getIn(path);

		let p, e = History.prototype[move].call(model.history, { entities: entities });
		Array.isArray(e) ? (p = e[0], e = e[1]) : (p = e);

		const state = { layout: p.layout };
		state[this.stateGetKey(this.state)] = this.state[this.stateGetKey(this.state)].mergeIn(["selected"], p.selected.filter((_, k) => e.entities.get(k).size === entities.get(k).size));
		this.setState(state);

		setTimeout(() => {
			const entities = e.entities;
			model.set(entities);

			Seq(this.entities).filter(e=>!e.global).forEach((_, k) => {
				const g = model["_" + k];
				model[k] = entities.get(k).map((v, k) => g[k].set(v, true)).toObject();
			});
			model.build(this);
			this.setState({ Model: this.state.Model.setIn(path, entities) });
		}, 0);
	}
} );
