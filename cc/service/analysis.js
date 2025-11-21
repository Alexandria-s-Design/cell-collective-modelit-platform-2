import axios from "axios";
import { getenv } from "../util/environment";

const request = axios.create({
	baseURL: `http://${getenv("ANALYSIS_HOST")}:${getenv("ANALYSIS_PORT")}`
});

export const AnalysisMiddleware = (req, res, next) => {
	request.defaults.headers.common = req.headers;
	next();
};

export default {
	request, AnalysisMiddleware
};
