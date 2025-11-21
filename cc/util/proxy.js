import https from "https";
import axios from "axios";
import moment from "moment";

import logger from '../logger';

import sample from "lodash.sample";
import isEmpty from "lodash.isempty";

let _PROXIES          = [ ];
const _LAST_PROXY_FETCH = moment();

const httpsAgent = new https.Agent({ rejectUnauhtorized: false });
const iAxios = axios.create({ httpsAgent });

const getRandomProxy = async ({ refresh = false } = { }) => {
    const now   = moment();
    const fetch = moment.duration(now.diff(_LAST_PROXY_FETCH)).asDays() >= 1;

    if ( isEmpty(_PROXIES) || fetch || refresh ) {
        try {
            const response   = await iAxios.get("https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt");
            const { data }   = response;
    
            const proxies    = data.split("\n")
                .map(s => {
                    const splits = s.split(":");
    
                    return { host: splits[0], port: splits[1] };
                });

            _PROXIES         = proxies;
        } catch (e) {
            logger.error(`Unable to get Proxy List: ${e.toString()}`);
        }
    }

    const proxy = sample(_PROXIES);

    return proxy;
};

export { getRandomProxy };