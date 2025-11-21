import { ActionType } from "./actions";
import store from "store";

const initialState = {
    domain: store.get("application_domain") || "research"
}

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case ActionType.SET_APPLICATION_DOMAIN: {
            const { domain } = payload;
            
            store.set("application_domain",   domain);
            store.set("application_hostname", window.location.hostname);
        }

        default:
            return state
    }
}