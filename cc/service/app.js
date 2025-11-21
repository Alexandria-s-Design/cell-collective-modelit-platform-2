import axiosDL from "axios-debug-log/enable";
import axios from "axios";
import { getenv } from "../util/environment";

// Set max body length to 60 MB
// to handle large requests and avoid ERR_FR_MAX_BODY_LENGTH_EXCEEDED
const MAX_BODY_LENGTH = 60 * 1024 * 1024;

const request = axios.create({
	baseURL: `http://${getenv("APP_HOST")}:${getenv("APP_PORT")}`,
	maxBodyLength: MAX_BODY_LENGTH
});

export const AppMiddleware = (req, res, next) => {
	request.defaults.headers.common = req.headers;
	next();
};

const requestWithToken = (req, contentLength) => {
	let headers = { ...req.headers };
	headers['Authorization'] = '';

	if (req.user && req.user.basic_token) {
		headers['Authorization'] = `Basic ${req.user.basic_token}`;
	}
	if (contentLength) {
		headers["Content-Length"] = contentLength;
	}
	let apiRequest = axios.create({
		baseURL: request.defaults.baseURL, headers,
		maxBodyLength: MAX_BODY_LENGTH,
		timeout: 1800000 //30 min
	});
	return apiRequest;
}

export default {
	request, AppMiddleware, requestWithToken
};