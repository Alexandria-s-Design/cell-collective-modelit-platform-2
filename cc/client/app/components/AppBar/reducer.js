import { ActionType } from "./actions";

const initialState = {
    modelSearchString: null
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case ActionType.DO_SEARCH:
            return { ...state, modelSearchString: payload };
        default:
            return state
    }
};