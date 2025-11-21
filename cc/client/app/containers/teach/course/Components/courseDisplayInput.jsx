import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { CircularProgress } from '@mui/material';

import CourseCode, { CODEKEY_LENGTH } from './CourseCode';
import CourseInlineDisplay from './courseInlineDisplay';

import cc from '../../../../cc';
import CodeGroupInput from '../../../../components/CodeGroupInput';

class CourseDisplayInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      course: null,
      codeKeyVal: '',
      loading: false,
      error: null,
    };
    this.fetchCourseByCodeKey = this.fetchCourseByCodeKey.bind(this);
    this.enrollCourse = this.enrollCourse.bind(this);
  }

  onChangeCodeKey(rawVal) {		
			//this.setState({ codeKeyVal: rawVal });
			if (rawVal.length == CODEKEY_LENGTH) {
				this.fetchCourseByCodeKey(rawVal);
			} 
			// else {
			// 	this.setState({ course: null, error: `Course key have size of ${CODEKEY_LENGTH}` });
			// }		
  }

  enrollCourse(userId=null) {
    const { course } = this.state;
    if (!course) {
      return;
    }
    return cc.request
      .post(`/api/course/association/UserCourse`, {
        UserId: userId || this.props.user?.app_user_id,
        CourseId: course.id,
      })
      .then(() => {
				this.setState({
					codeKeyVal: ''
				});

				// this doesn't depend on the state var changed above, so no
				// need to pass it as a callback to setState.
        this.props.onEnrollCourse && this.props.onEnrollCourse(course);
      })
      .catch(err => {
        this.setState({
          error: 'Error loading course: ' + err.response.data.error.errors.map(e => e.message).join(' | '),
          loading: false,
        });
      });
  }

  fetchCourseByCodeKey(codeKey) {
    if (codeKey == null || codeKey.length == 0) {
      return;
    }
		codeKey=codeKey.toUpperCase();
    this.setState({ loading: true, error: null });
    cc.request
      .get(`/api/course?codeKey=${codeKey}`)
      .then(res => res.data)
      .then(data => {
        if (data.data.total == 0) {
          this.setState({ course: null, error: 'Course not found', loading: false });
        } else {
          this.setState({ course: data.data.data[0], error: null, loading: false });
        }
      })
      .catch(err => {
        this.setState({
          error: 'Error loading course: ' + err.response.data.error.errors.map(e => e.message).join(' | '),
          loading: false,
        });
      });
  }

  render() {
    const { onEnrollCourse } = this.props;
    const { course, loading, codeKeyVal, error } = this.state;
    return (
      <>
        <div style={{display: 'flex', alignItems: 'center'}}>
					<CodeGroupInput onEdit={this.onChangeCodeKey.bind(this)} />
          {onEnrollCourse && !loading && (
            <button className='btnEnroll' type="button" onClick={() => this.enrollCourse()}>Enroll</button>
          )}
        </div>
        {error && <div style={{ color: 'red', width: '100%', display: 'flex' }}>{error}</div>}
        {loading && <CircularProgress size={20} />}
        {course && !loading && (
          <div>
            {'Corresponding course: '} <CourseInlineDisplay course={course} />
          </div>
        )}
      </>
    );
  }
}

CourseDisplayInput.propTypes = {
  onEnrollCourse: PropTypes.func,
};

const mapStateToProps = state => ({
  user: state.auth?.user,
});
const mapDispatchToProps = state => ({});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(CourseDisplayInput);
