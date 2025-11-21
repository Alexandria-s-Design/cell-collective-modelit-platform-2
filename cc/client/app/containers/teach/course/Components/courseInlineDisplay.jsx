import React from 'react';
import PropTypes from 'prop-types';

import { courseDisplayFormatter } from './UserCourseDisplay/util';

class CourseInlineDisplay extends React.Component {
	render() {
		const { course } = this.props;
		return <>
			<span>{courseDisplayFormatter(course)}</span>
		</>;
	}
}

CourseInlineDisplay.propTypes = {
	course: PropTypes.object,
}

export default CourseInlineDisplay;