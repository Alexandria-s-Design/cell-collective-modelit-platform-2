import React from 'react';

import { useSelector, useDispatch } from "react-redux";
import Application, {TEACHING} from "../../../../../application";
import getModelView from "../../../../Model/actions";

export const CourseMenuToolbar = () => {
	const dispatch = useDispatch();
	const userIsLoggedIn = useSelector(state => !!(state.auth.user && state.auth.user.id));

	const addNewCourse = () => {
		const data = 
		{
				title: "Untitled Course",
				startDate: new Date(),
				endDate: new Date(),
		};
		dispatch(getModelView("course").create(data));
	}

	if(Application.domain === TEACHING){
		//TODO: add translations

		const canAdd = userIsLoggedIn;
		return (<>
			<input type="button" className="icon large-add" onClick={() => canAdd && addNewCourse()} disabled={canAdd ? "" : "disabled"} />
			<span>New Course</span>
		</>)
	}
	return null;
};