import React from 'react';
import reject from "lodash.reject";
import { CircularProgress } from '@mui/material';

import CourseDisplayItem from './courseDisplayItem';
import CourseDisplayInput from '../courseDisplayInput';
import ScrollableNative from '../../../../../component/base/scrollableNative';
import cc from '../../../../../cc';

class UserCourseDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enrolledCourses: [],
      error: null,
    };
    this.onEnrollCourse = this.onEnrollCourse.bind(this);
    this.onLeaveCourse = this.onLeaveCourse.bind(this);
  }
  componentDidMount() {
    this.fetchCourses();
  }

  fetchCourses() {
    this.setState({ loading: true });
    cc.request
      .get(`/api/course?my_enrolled&model_binding`)
      .then(res => res.data.data)
      .then(data => {
        this.setState({ enrolledCourses: data.data, loading: false });
      })
      .catch(e => {
        this.setState({ error: ' Error loading enrolled courses | ' + JSON.stringify(e), loading: false });
      });
  }

  onEnrollCourse(newCourse) {
		const onEnrollCourse = this.props.onEnrollCourse;
		onEnrollCourse && onEnrollCourse(newCourse);
    this.setState(prevState => {
      return { enrolledCourses: [...prevState.enrolledCourses, newCourse] };
    });
  }

  onLeaveCourse(id) {
    const newCourses = reject(this.state.enrolledCourses, course => course.id == id);
    this.setState({ enrolledCourses: newCourses });
  }

  render() {
		const {props} = this
		const showCourseList = props.displayCourseList 
    const { enrolledCourses } = this.state;
    const courses = enrolledCourses.map(course => {
      return (
        <li key={course.id}>
          <CourseDisplayItem course={course} onLeaveCourse={this.onLeaveCourse} />
        </li>
      );
    });
    return (
			<div>
				{showCourseList  && <ScrollableNative height="100px">
					<ul className="ul">{courses}</ul>
				</ScrollableNative>}
				{this.state.loading && <CircularProgress fontSize="small" />}
				<CourseDisplayInput onEnrollCourse={this.onEnrollCourse} />
			</div>
    );
  }
}

UserCourseDisplay.propTypes = {};

export default UserCourseDisplay;
