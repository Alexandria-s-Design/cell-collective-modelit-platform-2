import { 
    TYPE_ERROR, 
    TYPE_SUCCESS, 
    TYPE_WARNING, 
    showToast as showToastAction
} from './actions';
import { 
    store
} from '../store';

const showToast = message => {
    store.dispatch(showToastAction(message));
}

export default showToast;
export {TYPE_ERROR, TYPE_SUCCESS, TYPE_WARNING};