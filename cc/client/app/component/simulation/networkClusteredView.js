import { Range } from "immutable";
import { scaleOrdinal, schemeCategory10 } from "d3";
import NetViz from "ccnetviz";
import network from "./network";

const colors = (() => Range(0, 10).map(i => new NetViz.color(scaleOrdinal(schemeCategory10)[i])).toObject())();

export default network((_, avg, step) => colors[Math.floor(9.9 * avg[step])]);