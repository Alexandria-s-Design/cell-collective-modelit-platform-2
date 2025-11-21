import { ActionType } from "./actions";

import moduleReducer from './ModuleDM/reducer';

import store from "store";

const initialState =
{
    domain: store.get("application_domain") || "research",
    saving: false,
		savedModelId: 0,
};

export default (state = initialState, data) => {
    const modules = state.modules ? moduleReducer(state.modules, data) : moduleReducer();
    if(modules !== state.modules)
        {state = {...state, modules};}

    const { type, payload } = data;
    switch (type) {
        case ActionType.CHANGE_SAVING:
            return { ...state, saving: payload };

				case ActionType.SAVE_EVENT_COMPLETED:
					return {...state, savedModelId: payload};

        case ActionType.SET_APPLICATION_DOMAIN: {
                const { domain } = payload;
                
                store.set("application_domain",   domain);
                store.set("application_hostname", window.location.hostname);
        }

        default:
            return state;
    }
};