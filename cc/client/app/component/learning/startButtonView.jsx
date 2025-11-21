import React from 'react';
import Application from '../../application';
import { APP_ADD_COURSE, APP_START_LESSON, APP_RESUME_LESSON, APP_MODEL_CATEGORIES } from '../../util/constants';
import view from '../base/view';
import { LoadingCircle } from '../loading';
import request from '../../request';
import { result } from 'lodash';
import cc from '../../cc';
import Message from '../dialog/message';
import Utils from '../../utils';
import { Seq } from 'immutable';
import Add from '../../action/add';
import { history } from '../../store';

const BTN_CLASSES = 'raised no-transform expand standalone ';

function ViewAnalytics({ value, state, props }) {
	return (
		<div className={BTN_CLASSES + ' learning submitted'} disabled={state} onClick={() => props.actions.startFirstActivity(true)}>
			{/* <input type="button" onClick={props.actions.startFirstActivity(true)}/> */}
			<small className='smallClass' >Lesson Submitted!</small>
			{value}
		</div>
	)
}

function StartLesson({ disabled, className }) {
		return (<div className={Utils.css(className, (disabled && 'disabled'))}>
			<span>Start Lesson</span>
	</div>)
}

function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

class StartButton extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			buttonText: (Application.domain === "teaching" ? "Add to Course" : "Start Lesson"),
			loading: false,
			executed: false,
			disabled: false,
			submitChecked: false,
			redirectToModel: null,
			buttonState: 'started' // started,resume, view
		};
	}

	async fetchData() {
		if (Application.domain === "learning") {
			this.setState(prev => ({...prev, disabled: true}));
			await sleep(500);
			let versionId = this.props.model.top.id, version=1;
			let courseId = this.props.cc.course || 0;
			let category = this.props.cc.openedFromCategory || 'ALL';
			if (this.props.cc.openedFromCategory == APP_MODEL_CATEGORIES.MY_COURSES && !courseId) {
				courseId = 999999999;
			}
			if (this.props.model.top.selected) {
				version = this.props.model.top.selected.path[1];
			}
			if (Array.isArray(this.props.state.section)
				&& this.props.state.section[0].indexOf('LabelMyLearning') >= 0) {
					category = APP_MODEL_CATEGORIES.MY_LEARNING;
			}
			request.get(
				`/api/module/${versionId}/checkStartedLesson?version=${version}&source=startButton&courseId=${courseId}&category=${category}`
			).then(res => {
					if (!res.data.data) {
						return this.setState((prev) => ({...prev, loading: false, disabled: false }));
					}
					const lessonId = res.data.data.lessonId;
					const started = res.data.data.started
					const submitted = res.data.data.submitted;
					const versionId = res.data.data.versionId;
					let buttonText = '', buttonState = '';
					if (started) {
						buttonText = "Resume Lesson", buttonState = 'resume';
						// DISABLED: Asked to disable the feature
						// if (this.props.model.top.isPublic) {
						// 	buttonText = "Go to started lesson";
						// }
					}
					if (submitted) {
						buttonText = "View Lesson", buttonState = 'submitted';
					}
					if (started || submitted) {
						this.setState((prev) => ({...prev, buttonText, buttonState}),
							() => {
								this.props.cc.props.setCurrentLesson(lessonId, this.props.model.top.id,   submitted, null, null, started, versionId);
								this.props.actions.onEditPermission("edit", true, this.props.model.top);
						});
					} else {
						this.props.cc.props.setCurrentLesson(lessonId, this.props.model.top.id, false, null, null, false, versionId);
					}
					this.setState(prev => ({...prev, disabled: false, redirectToModel: lessonId}))
			}).catch(err => {
				this.setState((prev) => ({...prev, loading: false }), () => {
					this.props.cc.props.setCurrentLesson(null, null, false, null, null, false, versionId);
				});
			});
			console.log("componentDidUpdate", this.state.buttonText);
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	componentWillUnmount() {
		if (this.state.submitChecked === true) {
			this.setState({ submitChecked: false });
		}
	}

	navigateToFirstActivity() {
		this.props.actions.startFirstActivity(true);
	}

	async _startActivity(e) {
		let typeAct = (Application.domain === "teaching" ? APP_ADD_COURSE : APP_START_LESSON);

		if (Application.domain == 'learning' && this.state.buttonState == 'resume') {
			typeAct = APP_RESUME_LESSON;
			this.setState({ executed: true });
			this.props.actions.startFirstActivity(true);
			return;
		}
		if (Application.domain == 'learning' && this.state.buttonState == 'started') {
			this.props.actions.onEditPermission("edit", true, this.props.model.top);
		}
		await this.props.actions.startActivity(this.props.model, this.state.executed, typeAct);
		await sleep(500);
		this.setState({ executed: true });
	}

	render() {
		const { model: { top: { id } }, user: { id: userId }, isTeaching } = this.props;

		// if (!isTeaching && !userId) {
		// 	return <StartLesson disabled={true} className={`btnStartLesson`}/>
		// }

		const cname = BTN_CLASSES + (isTeaching ? "teaching" : "learning");
		let buttonClick = null;
		if (!(this.state.executed && isTeaching)) {
			if (isTeaching) {
				buttonClick = () => {
					this.props.actions.addToCourse(id, () => {
						this.props.actions.onShowMessageOnAction("Added to course!");
					});
				};
			} else if (this.state.buttonState === 'redirect') {
				buttonClick = async () => {

					window.history.replaceState(null, null, "#" + this.state.redirectToModel);
					await this.props.actions.routerExecuteURL();
					// this.props.cc.showDialog(Message, {
					// 	message: "You've been redirected to your lesson."
					// })
					// this.fetchData()
					//this.setState({ buttonText: 'Resume Lesson', buttonState: 'resume' })
					await sleep(2000)
					this.props.actions.startFirstActivity(true)
				}
			} else {
				buttonClick = () => this._startActivity();
			}
		}

		let btnDisabled = (this.state.executed && isTeaching) || this.state.disabled;
		return (
			<>{!isTeaching && this.state.loading ? <LoadingCircle /> :
				this.state.buttonState === "submitted" && !isTeaching ?
					(
						<ViewAnalytics state={btnDisabled} value={this.state.buttonText} props={this.props} />
					) :
					(<input type="button" value={this.state.buttonText} className={cname} onClick={buttonClick} disabled={btnDisabled} />)
			}
			</>
		)

	}
}

export default view((p) => {
	const { model: { top: { id } }, user: { workspace } } = p;
	const isTeaching = Application.domain === "teaching";
	return <StartButton {...p} isTeaching={isTeaching} hasModel={workspace && id in workspace} top />;
}, false);
