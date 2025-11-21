import { defaultViewState } from './reducer';
import { useDispatch, useSelector } from 'react-redux';

import cc from '../../cc';

const createAsyncActionType = type => ({
  [`${type}_REQUEST`]: `${type}_REQUEST`,
  [`${type}_SUCCESS`]: `${type}_SUCCESS`,
  [`${type}_FAILURE`]: `${type}_FAILURE`,
  [`${type}_ERROR`]: `${type}_ERROR`,
});

const ActionType = {
	RESET_MODEL_LIST: `RESET_MODEL_LIST`,
  Async: {
    ...createAsyncActionType('GET_MODEL_LIST'),
    ...createAsyncActionType('POST_MODEL'),
    ...createAsyncActionType('DELETE_MODEL'),
    ...createAsyncActionType('UPDATE_MODEL'),
  },
};

export async function apiJsonOrFail(type, url,  ...args) {
  const ret = await cc.request[type](`/api/${url}`, ...args);
  if (!ret.data || typeof ret.data !== 'object') {
    console.error(ret);
    throw new Error('API JSON error - response mismatch');
  }
  return ret;
}

const funCache = {};

export const getModel = model => {
  const cachedKey = model;
  if (funCache[cachedKey]) {
    return funCache[cachedKey];
  }

  const defPayload = {
    model,
  };

  function selectEntity(id) {
    return state => state.model && state.model[model] && state.model[model]._entities[id];
  }

  function useEntity(id) {
    return useSelector(selectEntity(id));
  }

  const create = data => async dispatch => {
    dispatch({
      type: ActionType.Async.POST_MODEL_REQUEST,
      payload: {
        ...defPayload,
      },
    });

    try {
      let response = await apiJsonOrFail('post', model, data);
      response = response.data;

      if (response.status == 'success') {
        dispatch({
          type: ActionType.Async.POST_MODEL_SUCCESS,
          payload: {
            ...defPayload,
          },
        });
      } else if (response.status == 'failure') {
        dispatch({
          type: ActionType.Async.POST_MODEL_FAILURE,
          payload: {
            ...defPayload,
          },
        });
      }
    } catch (err) {
      dispatch({
        type: ActionType.Async.POST_MODEL_ERROR,
        payload: {
          ...defPayload,
        },
      });
    } finally {
      //TODO: refractor to opportinustic :)
      //					TODO: throw new Error("REFRACTOR list");
      //					dispatch(list())
    }
  };

  const update = (id, data) => async dispatch => {
    const payload = {
      ...defPayload,
      params: data,
      type: model,
      id,
    };

    dispatch({
      type: ActionType.Async.UPDATE_MODEL_REQUEST,
      payload,
    });

    try {
      let response = await apiJsonOrFail('put', `${model}/${id}`, data);
      response = response.data;

      if (response.status == 'success') {
        dispatch({
          type: ActionType.Async.UPDATE_MODEL_SUCCESS,
          payload: {
            ...payload,
            response,
          },
        });
      } else if (response.status == 'failure') {
        dispatch({
          type: ActionType.Async.UPDATE_MODEL_FAILURE,
          payload: {
            ...payload,
            response,
          },
        });
      }
    } catch (err) {
      dispatch({
        type: ActionType.Async.UPDATE_MODEL_ERROR,
        payload,
      });
    } finally {
      // dispatch(getList(type))
    }
  };

  const remove = (id, domain) => async dispatch => {
    const payload = {
      ...defPayload,
      type: model,
      id,
    };

    dispatch({
      type: ActionType.Async.DELETE_MODEL_REQUEST,
      payload,
    });

    try {
      let response = await apiJsonOrFail('delete', `${model}/${id}/enroll`);
			
			if (domain !== 'learning') {
				response = await apiJsonOrFail('delete', `${model}/${id}`);
			}
			
      response = response.data;

      if (response.status == 'success') {
        dispatch({
          type: ActionType.Async.DELETE_MODEL_SUCCESS,
          payload: {
            ...payload,
            response,
          },
        });

        //todo: throw new error refractor list
      } else if (response.status == 'failure') {
        dispatch({
          type: ActionType.Async.DELETE_MODEL_FAILURE,
          payload,
        });
      }
    } catch (err) {
      dispatch({
        type: ActionType.Async.DELETE_MODEL_ERROR,
        payload,
      });
    } finally {
      // dispatch(getList(type))
    }
	};
	
	const reset = () => async dispatch => {
		const payload = {
      ...defPayload,
      type: model
    };

		dispatch({
			type: ActionType.RESET_MODEL_LIST,
			payload,
		});
	}

  return (funCache[cachedKey] = {
    useEntity,
		selectEntity,
		reset,
    create,
    update,
    remove,
  });
};

export const getModelView = (model, { url = '/', getParams = '' } = {}) => {
  const viewKey = `${url}${getParams}`;

  const cachedKey = `${model}|${viewKey}`;
  if (funCache[cachedKey]) {
    return funCache[cachedKey];
  }

  const defPayload = {
    model,
    viewType: {
      get: getParams,
    },
    viewKey,
  };

  //	let is_first_load = false;

  function useCount(...args) {
    return useList(...args).length;
  }

  function useListWithData(...args) {
    console.warn('useListWithData CAN HURT YOUR PERFORMANCE, PLEASE CONSIDER USING useList and useEntity');
    const entities = useSelector(state => state.model && state.model[model] && state.model[model]._entities) || {};
    const list = useList(...args);
    return list.map(id => entities[id] || {});
  }

  function useList(options = {}) {
    /*		if(!is_first_load){
			dispatch(list(options));
			is_first_load = true;
		}
*/
    const selectState = state => (state.model && state.model[model] && state.model[model][viewKey]) || defaultViewState;
    const data = useSelector(state => selectState(state).data);
    const version = useSelector(state => selectState(state)._version);
    const globVersion = useSelector(state => state.model && state.model[model] && state.model[model]._version);

    const dispatch = useDispatch();
    if (version !== globVersion) {
      dispatch(list(options));
    }

    //TODO: write functionality for pagination / infinite scroll
    return data;
	}
	
	const list = ({ since = 0 } = {}) => async dispatch => {
    const params = { since };
    const payload = {
      ...defPayload,
      params,
    };

    dispatch({
      type: ActionType.Async.GET_MODEL_LIST_REQUEST,
      payload,
    });

    try {
      const { data: response } = await apiJsonOrFail('get', `${model}${url}${getParams}`);
      const { status, data } = response;
			// data.data.sort((a,b) => {return new Date(a.endDate) - new Date(b.endDate)})
      data.data.sort((a,b) => {return new Date(a._updatedAt) - new Date(b._updatedAt)})

      if (status == 'success') {
        dispatch({
          type: ActionType.Async.GET_MODEL_LIST_SUCCESS,
          payload: {
            ...payload,
            loaded: {
              [data.name]: data.data,
            },
          },
        });
      } else if (status == 'failure') {
        dispatch({
          type: ActionType.Async.GET_MODEL_LIST_FAILURE,
          payload: {
            ...payload,
          },
        });
      }
    } catch (err) {
      dispatch({
        type: ActionType.Async.GET_MODEL_LIST_ERROR,
        payload: {
          ...payload,
        },
      });
    }
  };

  return (funCache[cachedKey] = {
    ...getModel(model),
    useList,
    useCount,
    useListWithData,
    list,
  });
};

export default getModelView;

export { ActionType };
