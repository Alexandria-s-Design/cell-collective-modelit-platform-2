import axios from "axios";
import Application from "./application";
import { getTimezoneInfo } from "./util/timezone";

const baseApiURL =  Application.api;
const baseCCAppURL = import.meta.env.VITE_CC_URL_CCAPP;

const request = axios.create({
	baseURL: baseApiURL || null,
    // headers: 
});
request.interceptors.request.use(config => {
    let data = localStorage.getItem("VERSION[0021].Main");
    data     = data && JSON.parse(data) || { };

    const token = data && data.user && data.user.token;

    if ( token ) {
        config.headers["X-AUTH-TOKEN"] = token;
    }

    const timezoneInfo = getTimezoneInfo();
    config.headers["X-Timezone"] = timezoneInfo.timezone;
    config.headers["X-Timezone-Offset"] = timezoneInfo.offset.toString();

    return config;
})

// ccapp request
const ccappRequest = axios.create({
	baseURL: baseCCAppURL || null,
    // headers: 
});

ccappRequest.interceptors.request.use(config => {
	let data = localStorage.getItem("VERSION[0021].Main");
	data     = data && JSON.parse(data) || { };

	const token = data && data.user && data.user.token;

	if ( token ) {
			config.headers["Authorization"] = `Bearer ${token}`;
	}

	const timezoneInfo = getTimezoneInfo();
	config.headers["X-Timezone"] = timezoneInfo.timezone;
	config.headers["X-Timezone-Offset"] = timezoneInfo.offset.toString();

	return config;
})

const getLoggedUser = () => {
  let user = null;
  const key = `VERSION[${Application.version}].Main`;
  const data = localStorage.getItem(key);
  if (data) {
    const results = JSON.parse(data);
    user = results.user;
  }
  return user;
}

export default request;

export {ccappRequest, baseApiURL, baseCCAppURL, getLoggedUser}