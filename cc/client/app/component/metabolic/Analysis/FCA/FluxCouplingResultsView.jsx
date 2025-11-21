import React from "react";
import { Seq } from "immutable";
import view from "../../../base/view";
import Panel from "../../../base/panel";


class Content extends React.Component {
	render() {
		const props = this.props;
		return (
			<Panel {...props.view}>
			</Panel>
		);
	}
}

export default view(Content, null);