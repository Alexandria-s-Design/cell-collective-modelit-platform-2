import NetViz from "ccnetviz";
import network from "./network";

const colors = {};
const window = 10;

export default network((props, avg, step) => {
	let p, n = 0, sum = 0;
	for (let i = step - window; i <= step; i++) {
		const v = avg[i];
		if (v !== undefined) {
			p !== undefined && (sum += (v - p));
			n++;
			p = v;
		}
	}
	const v = sum ? props.simulation.window * sum / n : 0;
	const i = Math.round(100 * v);
	return colors[i] || (colors[i] = new NetViz.color(0.5*(1 - v), 0.5*(1 + v), 1 - Math.abs(v), 1));
});