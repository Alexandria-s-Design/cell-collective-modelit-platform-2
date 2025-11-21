import isEmpty from "lodash.isempty"
import omit from "lodash.omit";
import uuidv4 from "uuid/v4";
import { version as VERSION } from "../../package"

import logger from "../logger";
import models from "../models";

import util from 'util';

class Response {
    constructor ({ status = Response.Status.SUCCESS, code = 200, data = { }, error = { } } = { }) {
        this.version    = VERSION
         
        this.id         = uuidv4().replace(/-/g, "");
        
        this.status     = status;
        this.code       = code;

        this.data       = data;
        this.error      = error;
    }

    set data (data) {
        this.status  = Response.Status.SUCCESS;
        this._data   = data;
        this.hasData = true;
    }

    set type (type) {
        this.code    = type.code;
    }

    setError (type, messages = [ ]) {
        this.status  = Response.Status.ERROR;
        this.hasData = false;

				if (type.hasOwnProperty('ErrorResponse')) {					
					messages = type.ErrorResponse.data;
					type = type.ErrorResponse.type;
				}

        this.error   = { message: type.message };
        this.code    = type.code;

        if ( messages ) {
            if ( !Array.isArray(messages) ) {
                messages = [messages];
            }

            this.error.errors = [ ];

            for (const message of messages) {
                this.error.errors.push({ "message": message });
            }
        }
    }

    get ok ( ) {
        if ( this.code < 400 ) {
            return true;
        } else {
            return false;
        }
    }

    get json  ( ) {
        const response  = { };
        
        response.version    = this.version;
        response.id         = this.id;
        response.status     = this.status;
        response.code       = this.code;

        if ( !isEmpty(this._data) || this.hasData ) {
            response.data  = this._data;
        } else 
        if ( !isEmpty(this.error) ) {
            response.error = this.error;
        }

        const store   = async function ( ) {
            try {
                await models.Response.create({ ...omit(response, "id"), responseID: response.id });
            } catch (err) {
                logger.error(`Unable to save Response ${util.inspect(response)} to DataBase: ${err}`); // use util.inspect instead of JSON.stringify in case of circular structure
            }
        }
        store();

        return response;
    }
}

Response.Status = class { };
Response.Status.SUCCESS = "success";
Response.Status.ERROR   = "error";

Response.HTTP   = class { };

Response.HTTP.OK                     = { code: 200, message: "OK" };
Response.HTTP.CREATED                = { code: 201, message: "Created" };
Response.HTTP.ACCEPTED               = { code: 202, message: "Accepted" };
Response.HTTP.NO_CONTENT             = { code: 204, message: "No Content" };

Response.Error  = class { };
Response.Error.BAD_REQUEST           = { code: 400, message: "Bad Request" };
Response.Error.UNAUTHORIZED          = { code: 401, message: "Unauthorized" };
Response.Error.FORBIDDEN             = { code: 403, message: "Forbidden" };
Response.Error.NOT_FOUND             = { code: 404, message: "Not Found" };
Response.Error.CONFLICT              = { code: 409, message: "Conflict" };
Response.Error.GONE                  = { code: 410, message: "Gone" };
Response.Error.PRECONDITION_FAILED 	 = { code: 412, message: "Precondition failed" };
Response.Error.UNPROCESSABLE_ENTITY  = { code: 422, message: "Unprocessable Entity" };
Response.Error.INTERNAL_SERVER_ERROR = { code: 500, message: "Internal Server Error" };

Response.getErrorResponse = function (error = new Error) {
	if (!error) {	return undefined; }
	const res = error.hasOwnProperty('response');
	const errorRes = {ErrorResponse: {type: null,	data: null}};
	if (res && error.response.status) {
		const codeRes = Object.values(Response.Error).filter(err => err.code == error.response.status);
		if (codeRes.length) {
			errorRes.ErrorResponse.type = codeRes[0];
		}
	}
	if (errorRes.ErrorResponse.type === null) {
		errorRes.ErrorResponse.type = Response.Error.INTERNAL_SERVER_ERROR;
	}
	errorRes.ErrorResponse.data = (res && error.response.data) || error.toString();
	return errorRes;
};

export default Response;