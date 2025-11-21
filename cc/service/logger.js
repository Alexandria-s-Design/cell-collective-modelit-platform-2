import axios from "axios";
import { getenv } from "../util/environment";

const request = axios.create({
	baseURL: `http://${getenv("LOGGER_HOST")}:${getenv("LOGGER_PORT")}`
});

export const LoggerMiddleware = (req, res, next) => {
	request.defaults.headers.common = req.headers;
	next();
};

export default {
	request, LoggerMiddleware
};