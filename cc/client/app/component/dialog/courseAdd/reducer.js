import { produce } from 'immer';
import { ActionTypes } from './actions';

export default (state = {}, { type, payload }) => {
	return produce(state, draftState => {
		if (type === ActionTypes.STORE_COURSES) {
			draftState.courses = payload;
		}
	});
};