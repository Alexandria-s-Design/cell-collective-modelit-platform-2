import React from "react";
import Application from "../../application";
import view from "../base/view";
import Panel from "../base/panel";
import PropertyArea from "../description/propertyArea";

import MetadataSingle from "../description/metadataSingle";
import { FormattedMessage } from "react-intl";
import ScrollableNative from "../base/scrollableNative";


class Content extends React.Component {
	render() {
		const { view, user, model, model: { top: { id } }, readonly, editable, actions, editableContent} = this.props;
		const p = { parent: this, actions: (editable && Application.domain === "teaching") ? actions : false, entity: model };

		const isEditingTeacher = editableContent && Application.domain === "teaching";
	
		const audienceLine = <MetadataSingle {...p} label="Audience" name="TargetAudience" />;
		const estimatedTime = <MetadataSingle {...p} name="EstimatedTime" label={!readonly && Application.domain === "teaching" && id !== undefined ?
			"Time (in Hours)" : "Time"} format={e => "~" + (e < 2 ? Math.round(e*60) + " minutes" : Math.floor(e) + " hours")} placeHolder={1}
			parse={e => parseFloat(e)} />;

		return (
			<Panel {...view} key={id} className="description learningView">
				<ScrollableNative height="80%" isOverview={true}>
					<FormattedMessage id="ModelsView.learningView.labelDescription" defaultMessage="Description">
						{(message)=>(<PropertyArea {...p} name="description" />)}
					</FormattedMessage>
					<div className="learning-bottom">
						{(p['entity']['targetAudience'] !== undefined) ? audienceLine : (isEditingTeacher ? audienceLine : null)}
						{(p['entity']['estimatedTime'] !== undefined) ? estimatedTime : (isEditingTeacher ? estimatedTime : null)}
					</div>
				</ScrollableNative>
			</Panel>
		);
	}
}

export default view(Content);
