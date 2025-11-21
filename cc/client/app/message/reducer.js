import { ActionType } from "./actions";
import toastr from 'toastr';
import 'toastr/toastr.scss';

const initialState = {
    actions: []
}

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case ActionType.SHOW_TOAST: {
            if(toastr[payload.type]){
                toastr[payload.type](payload.message, payload.title, payload.options);
            }else{
                console.error("toastr does not have type >>"+payload.type+"<<");
            }
            return { ...state };
        }

        default:
            return state
    }
}