// import { createStore, applyMiddleware } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
// import { composeWithDevTools } from '@redux-devtools/extension';
import { createReduxHistoryContext } from "redux-first-history";
import { createBrowserHistory as createHistory } from 'history';
// import { thunk } from 'redux-thunk';

import createReducers, { init } from './reducers';

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({ 
  history: createHistory(),
});

// const middlewares = [thunk, routerMiddleware]

// const store = createStore(
// 	createReducers(routerReducer), 
// 	composeWithDevTools(applyMiddleware(...middlewares)),
// );
const store = configureStore({
	reducer: createReducers(routerReducer),
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(routerMiddleware),
})

// init(store.dispatch.bind(store));

const history = createReduxHistory(store);

export { store, history };
