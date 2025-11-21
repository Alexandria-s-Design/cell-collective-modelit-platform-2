import { ActionType } from './actions';
import { ActionType as UserActionType } from "../../reducers/auth/actions";
import { produce } from 'immer';
import isEqual from "lodash.isequal";

const initialState = {};

export const defaultViewState = {
  data: [],
  _version: -2,
  loading: false,
  count: undefined,
};

const defaultModelState = {
  _entities: {},
  _version: 0,
};

function ensureState(state, payload) {
  const { model } = payload;
  if (!state[model]) {
    state = produce(state, draftState => {
      draftState[model] = defaultModelState;
    });
  }
  return state;
}

function ensureViewState(state, payload) {
  state = ensureState(state, payload);

  const { viewKey, model } = payload;
  if (!state[model][viewKey]) {
    state = produce(state, draftState => {
      draftState[model][viewKey] = defaultViewState;
    });
  }
  return state;
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
		case UserActionType.USER_LOGGED_IN:
		case UserActionType.USER_LOGGED_OUT: {
//      state = ensureViewState(state, payload);
			return initialState;
		}
    case ActionType.Async.GET_MODEL_LIST_REQUEST: {
      const { viewKey, model } = payload;
      state = ensureViewState(state, payload);

      if (state[model]._version !== state[model][viewKey]._version) {
        return produce(state, draftState => {
          draftState[model][viewKey]._version = draftState[model]._version;
          draftState[model][viewKey]._forceReload = true;
        });
      } else {
        return state;
      }
    }
    case ActionType.RESET_MODEL_LIST: {
      const {
        model
      } = payload;
			return ensureState(produce(state, draftState => {
				delete draftState[model];
			}), payload);
		}
		case ActionType.Async.GET_MODEL_LIST_SUCCESS: {
      const {
        viewKey,
        model,
				params: { since },
      } = payload;

      return produce(state, draftState => {
        if (draftState[model][viewKey]._forceReload) {
          draftState[model][viewKey].data = [];
          delete draftState[model][viewKey]._forceReload;
        }

        const data = draftState[model][viewKey].data;

        payload.loaded[model].forEach((row, index) => {
          const id = row.id;
          data[since + index] = id;
          draftState[model]._entities[id] = row;
        });
      });
    }
    //start of the PUT type/ID request >> begin opportunistic changes
    case ActionType.Async.UPDATE_MODEL_REQUEST:
      return produce(state, draftState => {
        const { params, id, type, model } = payload;

        if (!draftState[model] || !draftState[model]) {
          //throw error
        } else {
          const oldValue = draftState[model]._entities[id];
          draftState[model]._entities[id] = { ...oldValue, ...params };
          draftState[model]._prev = oldValue;
        }
      });

    //PUT type/ID request failed >> revert opportunistic changes to the previous value
    case ActionType.Async.UPDATE_MODEL_FAILURE:
    case ActionType.Async.UPDATE_MODEL_ERROR:
      return produce(state, draftState => {
        const { params, id, type, model } = payload;
        if (draftState[model]) {
          draftState[model]._entities[id] = draftState[model]._prev;
        }
        /*else{
								//throw error
							}*/
      });

    //PUT type/ID request succeded >> revert opportunistic changes and apply the real changes from the DB
    //   we might be able to keep the previous changes, but this architecture is little safer and it might only tri
    case ActionType.Async.UPDATE_MODEL_SUCCESS:
      return produce(state, draftState => {
        const {
          params,
          model,
          response: { data },
          id,
          type,
        } = payload;
        if (draftState[model]) {
          if (!isEqual(params, data)) {
            console.warn('API UPDATE_MODEL_SUCCESS returned different value, reverting to the previous and applying the value');
            draftState[model]._entities[id] = { ...draftState[model]._prev, ...data };
          }
          draftState[model]._version++;
          delete draftState[model]._prev;
        } else {
          //throw error
        }
      });

    //  begin opportunistic changes
    case ActionType.Async.DELETE_MODEL_REQUEST:
      return produce(state, draftState => {
        const { model, id } = payload;

        //remove entity
        //remove from the views

        const el = state[model]._entities[id];
        if (!el) {
          //throw error not found entity
          return;
        }
        delete draftState[model]._entities[id];

        const replaced = {};
        for (const key in state[model] || {}) {
          if (key.startsWith('_')) {
            continue;
          }

          const findIndex = draftState[model][key].data.findIndex(e => e === id);
          if (findIndex >= 0) {
            draftState[model][key].data.splice(findIndex, 1);
          }
          replaced[key] = findIndex;
        }
        draftState[model]._prevDeleted = {
          el,
          replaced,
        };
      });

    //  delete type/ID failed , revert back to prev changes
    case ActionType.Async.DELETE_MODEL_FAILURE:
    case ActionType.Async.DELETE_MODEL_ERROR:
      return produce(state, draftState => {
        const { model, id } = payload;

        if (!state[model]._prevDeleted) {
          console.warn('No prev data to restore');
          return;
        }
        const { el, replaced } = state[model]._prevDeleted;

        //restore id
        draftState[model]._entities[id] = el;
        for (const key in replaced) {
          const index = replaced[key];
          draftState[model][key].data.splice(index, 0, id);
        }

        delete draftState[model]._prevDeleted;
      });

    //  delete type/ID failed , revert back to prev changes
    case ActionType.Async.DELETE_MODEL_SUCCESS:
      return produce(state, draftState => {
        const { model } = payload;

        if (!draftState[model]._prevDeleted) {
          console.warn('No prev data to restore');
          return;
        }

        draftState[model]._version++;
        delete draftState[model]._prevDeleted;
      });

    //adding new model >> force invalidate states from the temporary values
    case ActionType.Async.POST_MODEL_SUCCESS:
      return produce(state, draftState => {
        const { model } = payload;
        draftState[model]._version++;
      });

    default:
      return state;
  }
};
