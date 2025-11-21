import axios from "axios";
import { getenv } from "../util/environment";
import RedisSession from "../cache";
import logger from "../logger";

const SESSION_KEY = `access_token:`;

const request = axios.create({
	baseURL: `http://${getenv("CCAPP_HOST")}:${getenv("CCAPP_PORT")}/v1`
});

const saveAccessTokenData = async (tokenKey, tokenData, expires = 900) => {
	logger.info(`Saving token session at CACHE system: ${tokenKey}`);
	await RedisSession.call('SET', `${SESSION_KEY}${tokenKey}`, JSON.stringify(tokenData), 'EX', expires);
}

const getAccessTokenData = async (tokenKey) => {
	let savedToken = await RedisSession.call('GET', `${SESSION_KEY}${tokenKey}`);
	if (!savedToken) { return	}
	return JSON.parse(savedToken);
}

export const removeAccessTokenData = async (tokenKey) => {
	logger.info(`Deleting token session at CACHE system: ${tokenKey}`);
	return RedisSession.call('DEL', `${SESSION_KEY}${tokenKey}`);
}

/**
 * This middleware should be used to verify whether
 * the user has a valid access token with the user management system.
 */
export const CCAppMiddleware = async (req, res, next) => {
	request.defaults.headers.common = req.headers;
	let access_token = req.headers['authorization'] //x-auth-token
	// access_token = 'Bearer TOKEN';
	request.defaults.headers['Authorization'] = `${access_token}`;

	try {
		access_token = `${access_token}`.replace('Bearer ', '');
		if (!access_token) {
			throw new Error("Token not defined.");
		}
		let token_session = await getAccessTokenData(access_token);
		if (token_session) {
			logger.info(`Retrieved token session from CACHE system: ${access_token}`);
			return next();
		}
		let { data: userData } = await request.get("/auth/token/verify")
		userData = userData.data.user;
		logger.info("Token expires at "+ userData.expires + " ("+userData.expires_at+")")
		await saveAccessTokenData(access_token, userData, userData.expires);
	} catch(err){
		let errorCode = 500
		let message = {
			id: null,
			status: 'error',
			code: errorCode,
			message: '',
			service: 'web',
		};
		if (err.response) {
			let resData = err.response.data;
			if (resData) {
				errorCode = resData.code;
				message.id = resData.id;
				message.code = resData.code;
				message.data = resData.data;
				message.version = resData.version;
				message.message = resData.message;
				message.service = 'ccapp';
			} else {
				message.message = 'Unknown';
			}
		} else {
			message.message = 'Error on connecting with CCAPP. '+err.message;
		}
		return res.status(errorCode).json(message);
	}
	next();
};

export const CCAppErrorHandler = (error) => {
	let errorMessage;
	if ('response' in error) {
		let errContentType = error.response.headers['content-type'];
		if (errContentType === 'application/json') {
			if ('error' in error.response.data.data) {
				errorMessage = error.response.data.data.error;
			}
			else if ('details' in error.response.data.data) {
				errorMessage = error.response.data.data.message;
			} 
			else {
				errorMessage = 'Error in CCApp response.';
			}			
		} else {
			errorMessage = 'It was unable to retrieve data from CCApp.'
		}
	} else {
		errorMessage = error;
	}
	throw new CCAppException(errorMessage);
}

export class CCAppException extends Error {
  constructor(message) {
    super(message);
    this.name = "CCAppException";
  }
}

const requestWithToken = (authToken, req) => {
	let headers = {};
	if (req) {
		headers = { ...req.headers };
	}
	if (authToken) {
		headers['Authorization'] = `Bearer ${authToken}`;
	}
	let apiRequest = axios.create({
		baseURL: request.defaults.baseURL, headers
	});
	return apiRequest;
}

export default {
	request, CCAppMiddleware, requestWithToken
};
