import React from 'react';
import view from '../base/view';
import classnames from 'classnames';
import Application from '../../application';

class Content extends React.Component {
	
		static defaultProps = {
				minWidth: 25,
				minHeight: 25,
		}

		constructor(props) {
        super(props);
				this.state = {
					submitted: true
				}
		}

		componentDidMount() {
			this.props.actions.checkIsSubmitted(this.props.model).then(result => {
				this.setState({
					submitted: result
				});
			});
		}

		
    render() {
				const { editableContent, editable, actions, model, drag, cc: { state: { blockSubmit } } } = this.props;

				const isTeaching   = Application.domain === "teaching";
				const isLearning   = Application.domain === "learning";

        const disabled			=  actions.checkLessonComplete();
        const _onClick			= isLearning ? (this.state.submitted ? null: actions.submitActivity.bind(null, model)) : null;



				const onClick = () => {
					if (actions.checkLessonComplete()) {
						_onClick && _onClick();
						// this.state.submitted = !this.state.submitted;
					} else {
						actions.onShowMessageOnAction("Please ensure you have completed all lesson activities before submitting.");
					}
				};

				return 		<input 
												id="download"
												type="button" 
												value={this.state.submitted ? "Lesson Submitted" : "Submit Lesson"} 
												className="icon base-download"
												onClick={onClick} 
												onMouseDown={
															isTeaching && editable ? drag : null
												} 
												disabled={disabled} 
												style={{display: 'none'}}
									/>;
				
    }
}

export default view(Content, undefined, undefined, undefined, undefined, undefined, false);