import { ActionType } from "./actions";

const initialState = {
     type: null,
    props: { }
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case ActionType.OPEN_MODAL:
            return { ...state, ...payload }

        case ActionType.HIDE_MODAL:
            return initialState

        default:
            return state
    }
};