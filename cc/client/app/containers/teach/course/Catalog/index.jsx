import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Seq } from "immutable"

import messages from './messages';
import CoursePreview from '../CoursePreview';
import { getModelView } from '../../../Model/actions';
import Tab from '../../../../components/Tab';
import Application from '../../../../application';
import ScrollableNative from '../../../../component/base/scrollableNative';
import { UserCourseDisplay } from '../Components';

import { CCContext } from '../../../Application';

export const PUBLISHING_ENABLED = false;
export const teachCourseData = getModelView('course', { getParams: '?my_courses&model_binding' });
export const learnCourseData = getModelView('course', { getParams: '?my_enrolled&model_binding' });

const PublishedCourses = (props) => {
  const moduleView = getModelView('course');
  let courses = [...moduleView.useList()];
  courses.reverse();
  return courses.map(courseId => <CoursePreview {...props} key={courseId} courseId={courseId} />);
};

const MyCourses = (props) => {
  const moduleView = teachCourseData;
  let courses = [...moduleView.useList()];
  courses.reverse();
  courses = Seq(courses).toArray()
  return courses.map(courseId => <CoursePreview {...props} key={courseId} courseId={courseId} editable={true} />);
};

const MyLearningCourses = (props) => {
  const moduleView = learnCourseData;
	let courses = [...moduleView.useList()];
  courses.reverse();
  courses = Seq(courses).toArray()
  return courses.map(courseId => <CoursePreview {...props} key={courseId} courseId={courseId} />);
};

class Catalog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTabIndex: 0,
    };
  }

  render() {
    const { props, state } = this;
    const { intl, collapsed, addNewCourse, resetCourses } = props;

		const { currentTabIndex } = state;
		
    const allTabs = (Application.domain == 'teaching'
      ? [
          PUBLISHING_ENABLED && {
            name: 'published_courses',
            title: intl.formatMessage(messages.CourseDashBoardCourseCatalogPublishedCourses),
            getContent: (cc) => <PublishedCourses cc={cc} />,
          },
          {
            name: 'my_courses',
            title: intl.formatMessage(messages.CourseDashBoardCourseCatalogMyCourses),
            getContent: (cc) => <MyCourses cc={cc} collapsed={collapsed} />,
						actions: [
								{
										name: "add",
										title: "Add a course",
										onClick: addNewCourse
								}									
						]
          },
        ]
      : [
          {
            name: 'my_courses',
            title: intl.formatMessage(messages.CourseDashBoardCourseCatalogMyCourses),
						getContent: (cc) => <MyLearningCourses cc={cc} collapsed={collapsed} />,
          },
        ]
    ).filter(e => e);

    const selectedTab = allTabs[currentTabIndex] || (() => []);

    return (
      <Tab>
        <Tab.List style={{borderBottom: 'none', height: '50px'}}>
          {false &&
            allTabs.map(({ title, name }, key) => (
              <Tab.Link
                key={name}
                active={key == currentTabIndex}
                onClick={() => {
                  this.setState({
                    currentTabIndex: key,
                  });
                }}>
                {title}
              </Tab.Link>
            ))}
					{Application.domain === 'learning' &&	<UserCourseDisplay displayCourseList={false} onEnrollCourse={resetCourses} />}
          <Tab.Actions>
            {(selectedTab.actions || []).map((action, key) => (
              <Tab.Action key={key} {...action} />
            ))}
          </Tab.Actions>

        </Tab.List>
		
        <Tab.Content active={true} style={{marginTop: '5px'}}>
          <ScrollableNative>
						<CCContext.Consumer>{selectedTab.getContent}</CCContext.Consumer>
					</ScrollableNative>
        </Tab.Content>
      </Tab>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
	addNewCourse : () => {
		const data = 
		{
				title: "Untitled Course",
				startDate: new Date(),
				endDate: new Date(),
		};
		dispatch(getModelView("course").create(data));
	},
	resetCourses: () => {
		dispatch(learnCourseData.reset());
	}
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Catalog));
