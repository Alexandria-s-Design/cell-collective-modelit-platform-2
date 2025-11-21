import Application from "../../../../application";

import { ActionType, WORKSPACE } from "./actions";

const initialState =
{
    workspace: Application.isEducation ? WORKSPACE.CONTENT: WORKSPACE.MODEL,
};


export default (state = initialState, data = {}) => {
    const { type, payload } = data;

    switch (type) {
        case ActionType.CHANGE_WORKSPACE:
            return { ...state, workspace: payload.workspace };
        default:
            return state;
    }
}

