import React from 'react';
import {connect} from 'react-redux';
import { Seq } from 'immutable';

import { getModel } from '../../../containers/Model/actions';

import view from '../../base/view';
import ScrollableNative from '../../base/scrollableNative';
import { ActionTypes } from './actions';
import cc from '../../../cc';

import './style.scss';

let REQUESTED = false;

class CourseAddDialog extends React.Component {

	getCourses() {
		cc.request.get('/api/course?my_courses').then(payload => {
			const courses = payload.data.data.data;
			this.props.setCourses(Seq(courses).sortBy(course => course.title).toArray());
		});
		REQUESTED = true;
	}

	addModelToCourse(courseId) {
		const course = this.props.getCourse(courseId);
		if (course.models.includes(this.props.model)) {
			this.props.message("This module is already in that course.");
			return;
		}
		this.props.updateCourse(courseId, {
			models: [{ id: this.props.model, type: 'add' }]
		});
		this.props.close();
	}

	render() {
		const courses = Seq(this.props.courses).filterNot(c => {
			const cmodel = this.props.getCourse(c.id);
			return !cmodel || cmodel.models.includes(this.props.model);
		}).toArray();

		let content;
		if (!this.props.courses) {
			content = <img src="/assets/images/loading.gif" alt="loading" className="center" />;
			if (!REQUESTED) this.getCourses();
		} else if (courses.length === 0) {
			content = <h3 className="center">
				You have no courses which do not already contain this module.
			</h3>;
		} else {
			content = (<ScrollableNative><ul>
				{courses.map((course, idx) => <li key={idx} onClick={this.addModelToCourse.bind(this, course.id)}>{course.title}</li>)}
			</ul></ScrollableNative>);
		}

		return (<div className="course-add">
			{content}
		</div>);
	}
}

const e = view(CourseAddDialog, "Select a Course");
e.width = 300;
e.height = 200;

const courseModel = getModel('course');
const mapStateToProps = state => ({
	courses: state.addCourse.courses,
	getCourse: (id) => courseModel.selectEntity(id)(state)
});
const mapDispatchToProps = dispatch => ({
	setCourses: (courses) => dispatch({
		type: ActionTypes.STORE_COURSES,
		payload: courses
	}),
	updateCourse: (courseId, course) => dispatch(courseModel.update(courseId, course))
});

export default connect(mapStateToProps, mapDispatchToProps)(e);