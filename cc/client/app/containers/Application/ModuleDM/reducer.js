import { ActionType } from "./actions";
import moduleReducer from './Module/reducer';
import {URL as ModuleURL} from './Module/actions';

import { produce } from "immer";
//import startButtonView from "../../../component/learning/startButtonView";

const initialState =
{
    selected: null,
		selectedXz: null,
    modules: {},
		currLesson: {}
};


export default (state = initialState, data = {}) => {
    const { type, payload } = data;

    return produce(state, draftState => {
        const checkSelected = () => {
            //TODO: this would keep consistency of the selected model and eventually do auto selection
        }


        switch(type){
            case ActionType.REPLACE_MODELS:
            //call the remove of the current models and replace them with current models (continue with INIT_MODELS)
            {
                for(const moduleId in state.modules){
                    delete draftState[moduleId];
                }
                draftState.modules = {};
            }
            case ActionType.INIT_MODELS:
            {
                for(const moduleId in payload){
                    draftState.modules[moduleId] = true;
                    draftState[moduleId] = moduleReducer();
										if (moduleId < 0) {
											draftState.selected = moduleId;
										}
                }
                return;
            }
            case ActionType.REMOVE_MODELS:
            {
                const { ids } = payload;
                ids.forEach(id => {
                    if(draftState.modules[id]){
                        delete draftState[id];
                        delete draftState.modules[id];
                    }
                });
                checkSelected();
                return;
            }
            case ActionType.COPY_MODEL:
            {
                const {fromId, toId} = payload;
                draftState.modules[toId] = true;
                draftState[toId] = draftState[fromId];
                return;
            }
            case ActionType.SELECT_MODEL:
            {
                const {id} = payload;
                if(!state.modules[id]){
                    console.warn(`Selected model ${id} not found`)
                }
                draftState.selected = id;
                return;
            }
						case ActionType.LESSON_SELECTED:  {
							draftState.currLesson = payload;
							return;
            }
						case ActionType.SUBMITTED_LESSONS:  {
							draftState.submittedLessons = payload;
							return;
            }
        }

        //handle module actions
        if(type && type.startsWith(ModuleURL)){
            let {moduleId} = payload;
            if(moduleId === 'selected'){
                moduleId = state.selected;
            }
            if(!state.modules[moduleId]){
                console.warn(`Module for action (${moduleId}) not found`)
            }else{
                const newState = moduleReducer(state[moduleId], data);
                if(newState !== draftState[moduleId]){
                    draftState[moduleId] = newState;
                }
            }
        }

    });
}
