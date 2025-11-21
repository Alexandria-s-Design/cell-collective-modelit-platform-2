import { ActionType } from "./actions";


const defaultState = {
    loading: false,
    user  : undefined,
    init        : {},
    errorMsg    : undefined,
};


const modifyUser = (loggedUser) => ({
    ...loggedUser, 
    name: ((loggedUser.firstName || "") + " " + (loggedUser.lastName || "")).trim() || loggedUser.email || ""
});

const reducer = (state = defaultState, { type, payload }) => {
    switch (type) {
        case ActionType.SUBSCRIBE_SUBMITTED: {
            return {...state, loading: true};
        }
        case ActionType.SUBSCRIBE_FINISHED: {
            return {...state, loading: false};
        }
        case ActionType.USER_LOGGED_IN: {
            const { deprecatedUser, userMeData } = payload;

            const user = modifyUser({...userMeData, ...deprecatedUser});

            state = {...state, user};
            break;
        }
        case ActionType.USER_LOGGED_OUT: {
            state = { ...state, user: null };
            break;
        }
    }
    return state;
};

export default reducer;
