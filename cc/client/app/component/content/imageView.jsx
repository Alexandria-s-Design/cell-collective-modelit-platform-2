import React from 'react';
import { Seq } from 'immutable';
import Panel from '../base/panel';
import view from '../base/view';
import CheckboxN from '../base/checkboxN';
import Update from '../../action/update';
import Application from '../../application';
import Scrollable from '../base/scrollable';
import RichEditable from '../base/richEditable';
import { DropzoneWrapper } from './dropzoneWrapper';

class Content extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            message: <div className="dropzone-signed">Drop Image or Click to Upload</div>
        };
    }
    shouldComponentUpdate(props, state){
            return props.entities !== this.props.entities;
    }
    render(){
        const { entity, title, ext, user, editable, actions, view, view: {parentWidth} } = this.props;

		const onProgress = (e, p) => this.setState({ progress: p.loaded / p.total });
		const init = (e) => this.setState({ entity: e.first(), progress: 0 });
		const done = (k, v) => {
			const e = this.state.entity;
			e.Persisted = k;
			actions.batch(Seq(["name", "token", "uploaded"]).map(e=>new Update(entity, e, v.get(e))).toArray());
		};
		const reject = () => this.setState({message: "Rejected: Only Image files allowed"});

        let image;
        if(entity.token){
          image = (<img src={Application.url(entity)} className={entity.viewMode === 1 ? "skew" : "preserve-ratio"}/>);
        }else if(user){
          image = (<div className="preserve-ratio">
              <img src="/assets/images/upload.png" className="background-upload-icon"/><br/>
              <span className="line1">Drop Image or</span><br/>
              <span className="line2">Click to Upload</span>
            </div>);
        }else{
          image = (<div className="preserve-ratio">
              <span className="line1">Please login for</span><br/>
              <span className="line2">Image to Upload</span>
            </div>);
        }

				const acceptedFormats = {
					'image/apng': [],
					'image/avif': [],
					'image/gif': [],
					'image/jpeg': [],
					'image/png': [],
					'image/svg+xml': [],
					'image/webp': [],
				};

        return (
            <div>
                <Panel {...view} height={entity.showDescription ? '70%' : '100%'}>
                    <div className="drop-component">
                            {!Application.isLearning  && 
														<DropzoneWrapper onDrop={actions.uploadDocuments.bind(null, init, done, onProgress)} message={this.state.message} onReject={reject} acceptedFormats={acceptedFormats}/>}
                            <div className="uploaded-image">{image}</div>
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

const Actions = ({entity, actions: {onEdit}, editable}) => {
	const mode = {
		title : "viewMode",
		type : undefined,
		onEdit : null,
		className :'icon base-image',
	}
	if (editable && entity) {
		mode.title = "View mode - "+viewModes[entity.viewMode],
		mode.type = CheckboxN,
		mode.value = entity.viewMode,
		mode.numStates = 2,
		mode.onEdit = onEdit.bind(null, entity, 'viewMode')
	}

	return 	{
  mode: mode,
  description: editable && entity && {
      title: descriptionModes[entity.showDescription],
			className: entity.showDescription ? 'icon base-description' : 'icon base-description-disabled',
      type: CheckboxN,
      value: entity.showDescription?1:0,
      numStates: 2,
      onEdit: (v) => onEdit(entity, 'showDescription', !!v)
  }
}
};

export default view(Content, view.EntityMultipleHeader, Actions);
