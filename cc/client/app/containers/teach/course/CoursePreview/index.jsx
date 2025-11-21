import React from 'react';
import { connect } from 'react-redux';

import ModelCarousel from './ModelCarousel';
import CourseHeader from './CourseHeader';
import CourseModelCard from './CourseModelCard';
import { formatCourseCode } from '../Components/CourseCode';
import { openModal } from '../../../../components/Modal/actions';
import { CourseLink } from '../Components';
import Panel from '../../../../components/Panel';
import { getModel, apiJsonOrFail } from '../../../../containers/Model/actions';
import CourseCode, { UNKNOWN_CODE } from '../Components/CourseCode';
import showMessage, { TYPE_ERROR } from '../../../../message';
import Utils from '../../../../utils';
import { CourseAddModelCard } from './CourseAddModelCard';
import Application from '../../../../application';
import { Tooltip as ReactTooltip } from "react-tooltip";

import Message from '../../../../component/dialog/message';
import Confirmation from '../../../../component/dialog/confirmation';

import './style.scss';

import cc from '../../../../cc';
import { setSubmittedLessonsAction } from '../../../Application/ModuleDM/actions';
function downloadDataAsCSV(name, colDef = [], data) {
	const fieldDelimiter = ',';
	const formatCell = (s) => s;

	const rows = [];
	//buildHeaders
	rows.push(
		colDef
			.map(({ name, title }) => title || name)
			.map(formatCell)
			.join(fieldDelimiter),
	);

	data.forEach((dataRow) => {
		rows.push(
			colDef
				.map(({ formatter, name }) => formatter(dataRow[name], dataRow))
				.map(formatCell)
				.join(fieldDelimiter),
		);
	});

	const text = rows.join('\n');
	Utils.downloadBinary(name + '.csv', new Blob([text], { type: 'application/text' }));
}

async function downloadAPIasCsv(name, colDef = [], ...args) {
	try {
		const { data: response } = await apiJsonOrFail(...args);
		const { status, data } = response;
		if (status == 'success') {
			//success
			downloadDataAsCSV(name, colDef, data);
		} else {
			throw new Error(`API responded status code ${status}`);
		}
	} catch (e) {
		console.error(e);
		showMessage({
			message: 'Error downloading data',
			type: TYPE_ERROR,
		});
	}
}

const defaultOptions = {
	formatter: (s) => s,
};

function mkColumnDef(name, options = {}) {
	return {
		...defaultOptions,
		...options,
		name,
	};
}

class CoursePreview extends React.Component {

	constructor(props) {
		super(props)
	}
	
	UNSAFE_componentWillMount() {
		this.Image = {};
}

	componentDidMount(){
		if (Application.isLearning) {
			this.getSubmittedLessonList(this.props.course.models);
		}
	}
	addModelToCourse(modelId) {
		const {
			props: { course, courseId, updateCourse },
		} = this;
		const models = course?.models || [];
		if (models.indexOf(modelId) >= 0) {
			return; //already there
		}
		updateCourse(courseId, {
			models: [{ id: modelId, type: 'add' }],
		});
	}

	removeModelFromCourse(modelId) {
		const {
			props: { courseId, updateCourse },
		} = this;
		updateCourse(courseId, {
			models: [{ id: modelId, type: 'remove' }],
		});
	}

	get actions() {
		const {
			props: { deleteCourse, updateCourse, openModal, courseId, course },
		} = this;


		// 	const showInsights = () => {
		// 		course && openModal("CourseInsights", {
		// 			courseId: course.id,
		// 			// modelName: model.top.name,
		// 			title: `${course.title} - Insights`,
		// 			width: 800, 
		// 			height: 700
		// 	});
		// }


		const actions = [
			/*			this.editable &&
			course && {
				name: course.published ? 'public' : 'human',
				title: course.published ? 'Unpublish' : 'Publish',
				onClick: () => {
					/*** published and unpublished *
					/*** TODO: maybe add alert for unpublishing :) *
					updateCourse(courseId, { published: !course.published });
				},
			},
*/
			course && <CourseCode value={course.codeKey || UNKNOWN_CODE} />,
			this.editable && <span style={{ position: 'relative', top: '-5px' }}>&nbsp;or&nbsp;</span>,
			this.editable && <CourseLink key={`courseLink-${courseId}`} courseId={courseId} showMessage={(msg) => {
				this.props.cc.cc.showDialog(Message, { message: msg })
			}} />,
			//  disabled functionality as requested in tocket #2669
			// 	course && {
			//   name: 'human',
			//   title: 'Download user report',
			//   onClick: async () => {
			//     await downloadAPIasCsv(
			//       `${formatCourseCode(course.codeKey)} ${course.title} (${course.id}) - User report`,
			//       [mkColumnDef('email'), mkColumnDef('firstname', { title: 'first name' }), mkColumnDef('lastname', { title: 'last name' }), mkColumnDef('institution')],
			//       'get',
			//       `users/?belongToCourseId=${course.id}`,
			//     );
			//   },
			// },

				Application.domain == 'teaching' && course && (
					<span data-type="light" data-tip data-for="disabled-button">
						<input
							type="button"
							className="icon base-info"
							disabled
						/>
						<ReactTooltip className="tooltip" id="disabled-button" place="bottom" effect="solid" style={{ backgroundColor: "#232323", color: "white" }}>
							Students can access course by entering in the Course Key and clicking &ldquo;Enroll&rdquo; or by pasting the Quick-Add URL into their browser after they login to ModelIt!.
						</ReactTooltip>
					</span>
				),{
				name: 'close',
				title: 'Delete course',
				onClick: () => {
					/**** TODO: get notification if the user is deleting the published course
					 * 					>>> because he is also deleting it for the all users in LEARN
					 **/
					const message = `Do you really want to delete this course? Once it is removed this action is irreversible.`;
					const options = {
						okText: "DELETE",
						cancelText: "CANCEL"
					}
					const action = () => {
						deleteCourse(courseId, Application.domain);
					}

					this.props.cc.cc.showDialog(Confirmation, { message, action, ...options })
				},
			},
		].filter((e) => e);

		return actions;
	}
	get editable() {
		const {
			props: { editable },
		} = this;
		return !!editable;
		/*
			TODO: add authorId field into the DB

			const {props: {editable, course, user}} = this;
			return editable && course && user && course?.userId == user?.id;
*/
	}

	async getSubmittedLessonList (models){
		let modelsStr = models.join();
			 cc.request.get(`/api/module/${this.props.courseId}/checkSubmittedlesson?domain=${Application.domain}&queryList=${modelsStr}`)
			 .then(res => res.data.data)
			 .then(({ lessons })  => {
					let _lessons = [...new Set([
						...(this.props.submittedLessons?.models || []),
						...lessons
					])];
					this.props.setSubmittedLessons(_lessons);				
			 })
			 .catch(e => {
				 this.setState({ error: ' Error loading enrolled courses | ' + JSON.stringify(e), loading: false });
			 });
	}

	render() {
		const {
			props,
			props: { course, courseId, updateCourse },
		} = this;

		if (!course) {
			return <Panel />;
		}
		//TODO: check if the owner is the same like logged user
		const editable = this.editable;
		const models = course.models || [];

		return (
			<Panel>
				<Panel.Header>
					<CourseHeader
						{...course}
						onEdit={
							editable &&
							updateCourse &&
							((value) => {
								updateCourse(courseId, value);
							})
						}
						editable={editable}
					/>
					<Panel.Actions>
						{this.actions.map((action, id) => {
							// change this to check if action is instance of react class
							if (action.type !== undefined) {
								return action;
							} else {
								return <Panel.Action key={id} {...action} />;
							}
						})}
					</Panel.Actions>
				</Panel.Header>
				<Panel.Body>
					<ModelCarousel>
						{Application.domain === 'teaching' ? <CourseAddModelCard key="_new" onAdd={this.addModelToCourse.bind(this)} /> : null}
						{models.map((modelId) => (
							<CourseModelCard
								key={modelId}
								modelId={modelId}
								courseId={courseId}
								submittedLessons={this.props.submittedLessons}
								onRemove={
									editable &&
									(() => {
										this.removeModelFromCourse(modelId);
									})
								}
							/>
						))}
					</ModelCarousel>
				</Panel.Body>
			</Panel>
		);
	}
}

const courseModel = getModel('course');
const mapStateToProps = (state, { courseId }) => ({
	course: courseModel.selectEntity(courseId)(state),
	submittedLessons: state.app.modules ? state.app.modules.submittedLessons : {models: []},
	user: state.app.user,
});

const mapDispatchToProps = (dispatch) => ({
	deleteCourse: (courseId, domain) => dispatch(courseModel.remove(courseId, domain)),
	openModal: (...args) => dispatch(openModal(...args)),
	updateCourse: (courseId, course) => dispatch(courseModel.update(courseId, course)),
	setSubmittedLessons: (...args) => dispatch(setSubmittedLessonsAction(...args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CoursePreview);
