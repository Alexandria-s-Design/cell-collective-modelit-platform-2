import https from "https";
import axios from "axios";
import moment from "moment";

import { getenv } from "./util/environment";

const httpsAgent = new https.Agent({ rejectUnauthorized: false })

class Client {
    constructor ({
        apiKey  = getenv("API_KEY", {
            prefix: "EUTILS"
        }),
        proxy   = [ ]
    } = { }) {
        // if ( !apiKey ) {
        //     throw Error("Cannot initialize EUtils Client without a valid API Key.");
        // }

        this.apiKey     = apiKey;
        this.Axios      = axios.create({
            baseURL: Client.BASE_URL,
            httpsAgent
        });
        this.timestamps = { previous: null };
        this.nrequests  = 0;

        this.proxy      = proxy;
    }

    async request(method, url, args) {
        if ( !this.timestamps.previous ) {
            this.timestamps.previous = moment();
        }

        const now = moment();

        if ( moment.duration(now.diff(this.timestamps.previous)) ) {

        }

        const response  = await this.Axios[method](url, args);
        this.nrequests += 1;

        return response;
    }

    async einfo ({

    } = { }) {
        const response = await this.request("get", "einfo.fcgi", {

        });

        return response;
    }

    async esummary (id, {
        db      = "pubmed",
        retmode = null
    } = { }) {
        if ( Array.isArray(id) ) {
            id = id.join(",")
        }

        const response = await this.request("get", "esummary.fcgi", {
            params: {
                api_key: this.apiKey,
                db: db,
                id: id,
                retmode: retmode
            }
        });

        const { data } = response;

        return data;
    }
}

Client.BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/";

export default Client;