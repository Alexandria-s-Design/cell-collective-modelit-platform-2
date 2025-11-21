import NetViz from "ccnetviz";
import network from "./network";

const colors = {};

export default network((_, avg, step) => {
	const v = avg[step];
	const i = Math.round(100 * v);
	return colors[i] || (colors[i] = new NetViz.color(1 - v, v, 0, 1));
});