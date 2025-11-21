import uuid from 'uuid/v4';
import models from '../../models';
import { createDefaultAttributes } from '../../db/mixins/attributes';

class DbLoggerTransaction {
    constructor(params) {
        this._transaction_uuid = uuid();
        this._params = params;

    }
    async log(params) {
        //make sure that the return value is object
        const getObj = (e) => e || {};

        const data = { ...getObj(this._params.data), ...getObj(params.data) };
        await DbLogger.log({ ...this._params, ...params, data, transaction_uuid: this._transaction_uuid });
    }
}

class DbLogger {
    /*
        returns transaction which all of the records have the same transaction_uuid key

            these params would be used like default values for every call of log() inside the transaction
            params can be
                type - string
                action - string
                data - object
    */
    static getTransaction(params = {}) {
        return new DbLoggerTransaction(params);
    }
    /*
        params can be
            type - string
            action - string
            data - object
    */
    static async log(params = {}) {
        const { type, data, action, transaction_uuid } = params;
        if (!type)
            throw Error("YOU MUST SPECIFY LOG type");
        if (!params.user)
            throw Error("YOU MUST SPECIFY USER");
        if (!DbLogger.TYPES[type])
            throw Error(`type must be one of ${JSON.stringify(Object.keys(DbLogger.TYPES))}`);
        if (action && !DbLogger.ACTIONS[type][action])
            throw Error(`No action ${action} in type ${type}`);
        try {
            await models['logs'].create({
                /*_createdBy: req.user.id,*/
                ...createDefaultAttributes(models, params.user),
                type,
                transaction_uuid,
                action,
                message: data
            });
        } catch (e) {
            console.error('OOPS, LOGGER FAILED', e);
        }
    }
}

DbLogger.TYPES = {}
DbLogger.ACTIONS = {}



const addLoggingType = (key, options = []) => {
    DbLogger.TYPES[key] = key;
    DbLogger.ACTIONS[key] = {}
    options.forEach(v => {DbLogger.ACTIONS[key][v] = v;});
}



addLoggingType("PAYMENTS", [
    "SEND",
    "STRIPE_ERROR",
    "STRIPE_SUCCESS",
    "SAVE_SUCCESS",
    "SAVE_ERROR"
])

export default DbLogger;