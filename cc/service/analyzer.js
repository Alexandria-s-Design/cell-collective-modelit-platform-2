import axiosDL from "axios-debug-log/enable";
import axios from "axios";
import { getenv } from "../util/environment";

const request = axios.create({
	baseURL: `http://${getenv("ANALYZER_HOST")}:${getenv("ANALYZER_PORT")}`
});

export const Middleware = (req, res, next) => {
	request.defaults.headers.common = req.headers;
	next();
};

export default {
	request, Middleware
};