import React from 'react';
import { Seq } from 'immutable';
import Panel from '../base/panel';
import view from '../base/view';
import CheckboxN from '../base/checkboxN';
import Update from '../../action/update';
import { useDropzone } from 'react-dropzone';
import Application from '../../application';
import Scrollable from '../base/scrollable';
import RichEditable from '../base/richEditable';
import { DropzoneWrapper } from './dropzoneWrapper';
class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			message: <div className="dropzone-signed">Drop Video 2 or Click to Upload</div>
		};
	}
	shouldComponentUpdate(props, state) {
		return props.entities !== this.props.entities;
	}
	render() {
		const { entity, title, ext, user, actions, view, view: { parentWidth } } = this.props;
		let { editable } = this.props;

		const onProgress = (e, p) => this.setState({ progress: p.loaded / p.total });
		const init = (e) => this.setState({ entity: e.first(), progress: 0 });
		const done = (k, v) => {
			// const e = this.state.entity;
			// e.Persisted = k;
			actions.batch(Seq(["name", "token", "uploaded"]).map(e => new Update(entity, e, v.get(e))).toArray());
		};
		const reject = () => this.setState({ message: "Rejected: Only video files allowed" });

		let video;
		let apiUrl;

		if (entity.token) {
			apiUrl = Application.url(entity);
			editable = false;
			video = (<div>
				<video width="320" height="240" muted controls>
 					 <source src={apiUrl} type="video/mp4"/>
				</video>
				{/* <video src="https://www.w3schools.com/html/movie.mp4" controls preload="auto"/> */}
			</div>);
		} else if (user) {
			video = (<div className="preserve-ratio">
				<img src="/assets/images/upload.png" className="background-upload-icon" /><br />
				<span className="line1">Drop Video or</span><br />
				<span className="line2">Click to Upload</span>
			</div>);
		} else {
			video = (<div className="preserve-ratio">
				<span className="line1">Please login for</span><br />
				<span className="line2">video to Upload</span>
			</div>);
		}

		const acceptedFormats = {
      'video/mp4': [],
			'video/mp3': [],
      'video/webm': [],
      'video/ogg': [],
    };

		return (
			<div>
				<Panel {...view} height={entity.showDescription ? '70%' : '100%'}>
					<div className="drop-component">
						{editable && <DropzoneWrapper onDrop={actions.uploadDocuments.bind(null, init, done, onProgress)} message={this.state.message} onReject={reject} acceptedFormats={acceptedFormats}/>}
						<div className="uploaded-image">
							{video}
						</div>
					</div>
				</Panel>
				{entity.showDescription && (<Panel {...view} height="30%" top="70%">
					<Scrollable>
						<RichEditable
							value={entity.caption}
							onEdit={editable && actions.onEdit.bind(null, entity, "caption")}
							placeHolder="Click Here to Start..."
						/>
					</Scrollable>
				</Panel>)}
			</div>
		)
	}
}

const viewModes = {
	0: 'Preserve scale',
	1: 'Skew'
};

const descriptionModes = {
	[false]: 'Description hidden',
	[true]: 'Description shown'
};

const Actions = ({ entity, actions: { onEdit }, editable }) => {
	const mode = {
		title: "viewMode",
		type: undefined,
		onEdit: null,
		className: 'icon base-image',
	}
	if (editable && entity) {
		mode.title = "View mode - " + viewModes[entity.viewMode],
			mode.type = CheckboxN,
			mode.value = entity.viewMode,
			mode.numStates = 2,
			mode.onEdit = onEdit.bind(null, entity, 'viewMode')
	}

	return {
		mode: mode,
		description: editable && entity && {
			title: descriptionModes[entity.showDescription],
			className: entity.showDescription ? 'icon base-description' : 'icon base-description-disabled',
			type: CheckboxN,
			value: entity.showDescription ? 1 : 0,
			numStates: 2,
			onEdit: (v) => onEdit(entity, 'showDescription', !!v)
		}
	}
};

export default view(Content, view.EntityMultipleHeader, Actions);
