import axios from "axios";
import { getenv } from "../util/environment";
import { DEFAULT } from "../const";

const request = axios.create({
	baseURL: `http://${getenv("WEB_HOST", DEFAULT.HOST.WEB)}:${getenv("WEB_PORT", DEFAULT.PORT.WEB)}`,
	headers: {
		"X-Internal-Request": "true",
		"User-Agent": "Internal-Axios",
		"Accept": "*/*"

	},
	withCredentials: false
});

export class WebException extends Error {
  constructor(message) {
    super(message);
    this.name = "WebException";
  }
}

export default {
	request
};