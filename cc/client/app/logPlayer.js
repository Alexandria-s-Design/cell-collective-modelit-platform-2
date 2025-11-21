export default class {
	constructor(init, execute, update) {
		this.init = init;
		this.execute = execute;
		this.update = ( (up, e) => up(e === undefined ? this.position : this.position = e)).bind(this, update);
	}
	reset() {
		this.runner = null;
		this.update(-1);
	}
	load(name, record) {
		this.name = name.substring(0, name.lastIndexOf("."));
		this.record = record;
		this.map = null;
		clearTimeout(this.runner);
		this.reset();
	}
	run() {
		let i = this.position + 1;
		const actions = this.record.actions;

		if (i < actions.length) {
			const j = i;
			const b = actions[i];

			const next = () => {
				this.update(i);
				const s = this.state;
				this.runner = setTimeout(this.run.bind(this), i + 1 < actions.length ? (this.rewind ? 200 : (s.layout === "Simulation" && s.simulation === "start" ? Math.min(10000, actions[i + 1].time - b.time) : 1000)) : 0);
			};
			const group = e => (e.group === "Entity" && e.action !== "select") || (e.group === "Model" && e.action === "update");

			if (group(b)) {
				for (let e; (e = actions[i + 1]) && e.time === b.time && group(e); i++);
			}

			this.execute(this.map, this.state, actions.slice(j, i + 1), next);
			b.action !== "save" && next();
		}
		else {
			this.reset();
		}
	}
	async start() {
		if (this.position < 0) {
			await this.init(this.name, this.record, (m, s) => {
				this.map = m;
				this.state = s;
				this.runner = setTimeout(this.run.bind(this), 1000);
				this.update();
			});
		}
		else {
			this.runner = setTimeout(this.run.bind(this), 0);
			this.update();
		}
	}
	stop() {
		clearTimeout(this.runner);
		this.runner = null;
		this.update();
	}
}
