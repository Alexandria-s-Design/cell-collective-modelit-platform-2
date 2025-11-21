import {combineReducers} from "redux";

import app from "../containers/Application/reducer";
import modal from "../components/Modal/reducer";
import model  from "../containers/Model/reducer";
import message from "../message/reducer";
import auth from './auth';
import appBar from '../components/AppBar/reducer';
import addModelDropDown from '../containers/teach/course/CoursePreview/AddModelDropDown/reducer';
import addCourse from '../component/dialog/courseAdd/reducer';

export default (routerReducer) => combineReducers({
		router: routerReducer,
    app, 
    modal,
    model,
    message,
    auth,
    appBar,
		addModelDropDown,
		addCourse
});

export const init = (...args) => {

    /** Seeding of the store */

}