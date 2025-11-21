import React from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';


import { courseDisplayFormatter } from './util';
import CourseCode from '../CourseCode';
import CourseInlineDisplay from '../courseInlineDisplay';

import cc from '../../../../../cc';

import './style.scss';

class CourseDisplayItem extends React.Component {
  constructor(props) {
    super(props);
    this.leaveCourse = this.leaveCourse.bind(this);
  }

  leaveCourse(course) {
    if (!course && !course.id) {
      return;
    }
    return cc.request
      .delete(`/api/course/association/UserCourse`, { data: { 
				UserId: this.props.user?.id,
				CourseId: course.id,
			}})
      .then(res => res.data.data)
      .then(data => {
        this.props.onLeaveCourse && this.props.onLeaveCourse(course.id);
      })
      .catch(err => {
        this.setState({
          error: 'Error loading course: ' + err.response.data.error.errors.map(e => e.message).join(' | '),
          loading: false,
        });
      });
  }

  render() {
    const { course, onLeaveCourse } = this.props;
    return (
      <div className='course-display-item'>
        <span style={{ float: 'left' }}><CourseCode value={course.codeKey} /></span>
        {onLeaveCourse && (
          <button type="button" className='icon-button' style={{ float: 'right' }} onClick={() => this.leaveCourse(course)}>
            <RemoveCircleOutline fontSize={'small'} />
          </button>
        )}
        <span style={{ float: 'right', paddingRight: '3px' }}>
					<CourseInlineDisplay course={course}/> 
				</span>
      </div>
    );
  }
}

CourseDisplayItem.propTypes = {
  course: PropTypes.object,
  onLeaveCourse: PropTypes.func,
};

CourseDisplayItem.defaultProps = {
  course: null,
};

const mapStateToProps = state => ({
	user: state.auth?.user
});

export default connect(mapStateToProps)(CourseDisplayItem);