import React from 'react';
import view from '../base/view';
import classnames from 'classnames';
import Application from '../../application';
import { connect } from 'react-redux';


let isComplete = false;
class Content extends React.Component {


	static defaultProps = {
		minWidth: 250,
		minHeight: 100,
	}

	constructor(props) {
		super(props);
		this.state = {
			submitted: true,
			checkComplete: true,
			loading: false
		}
	}


	componentDidMount() {
		const courseId = this.props.state ? this.props.state.course : null;
		this.props.actions.checkIsSubmitted(this.props.model, courseId).then(result => {
			this.setState({
				submitted: result,
				checkComplete: this.props.actions.checkLessonComplete()
			});
		});
	}

	updateCheckComplete() {
		this.props.dispatch({
			type: 'CHECK_LESSON_COMPLETE',
			// payload: this.props.actions.checkLessonComplete()
			payload: isComplete
		})
	}


	render() {
		const { user, currLessonState, editableContent, editable, actions, model, drag, cc: { state: { blockSubmit } } } = this.props;

		const isTeaching = Application.domain === "teaching";
		const isLearning = Application.domain === "learning";
		let disabled = (isTeaching ? false : false);

		if (currLessonState && Object.keys(currLessonState).length && currLessonState.id && disabled) {
			disabled = currLessonState.submitted;
		}

		const _onClick = isLearning ? (this.state.submitted ? null : actions.submitActivity.bind(null, model)) : null;
		const onClick = () => {
			if (actions.checkLessonComplete() && _onClick) {
				(async () => {
					try {
						this.setState({ loading: true });
						// const { subscriptions } = await actions.onUserSubscribed();
						try {
							await _onClick(); this.setState({ loading: false });
						} catch (e) {
							this.setState({ loading: false });
						}

						actions.onConfirm("Please download Certificate of Completion by clicking the download icon.",
							async () => {
								try {
									await _onClick(); this.setState({ loading: false });
								} catch (e) {
									this.setState({ loading: false });
								}
							}, {
							okText: "OK",
							cancelText: "CANCEL",
							onCancel: () => this.setState({ loading: false })
							}
						);
					} catch (e) {
						this.setState({ loading: false });
					}
				})();
			} else {
				actions.onShowMessageOnAction("Please ensure you have completed all lesson activities before submitting.");
			}
		};

		return <input
			type="button"
			value={this.state.loading ? 'Submitting...' : (this.state.submitted ? "Lesson Submitted" : "Submit Lesson")}
			className={
				classnames(
					"raised no-transform expand standalone learning",
					isTeaching && editable && " draggable",
					onClick && "clickable"
				)
			}
			onClick={onClick}
			onMouseDown={
				isTeaching && editable ? drag : null
			}
			disabled={this.state.loading ? true : disabled}
		/>;
	}
}


export default view(Content, undefined, undefined, undefined, undefined, undefined, false);
