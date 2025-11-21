import React from 'react';
import PropTypes from 'prop-types';

import cc from '../../../../../cc';
import URLActionTemplate, { ENROLL_COURSE } from '../../../../../util/URLActionTemplate';

import './styles.scss';

export default class CourseLink extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      props: { courseId, showMessage },
    } = this;
    const linkParams = { courseId: courseId };
    return (
      <span
        className="course-link-copy-to-clip-board"
        onClick={() => {
          cc._.copyToClipboard(URLActionTemplate.constructUrl(ENROLL_COURSE, linkParams));
					showMessage("Your Quick-Add URL has been copied to your clipboard. Please share this URL with students so they can access your course in 1 step. Please remind them to log in prior to pasting the URL in their browser. Thank you!");
        }}
        title="Copy course link to clipboard">
        Quick-Add URL
      </span>
    );
  }
}

CourseLink.propTypes = {
  courseId: PropTypes.string.isRequired,
};
