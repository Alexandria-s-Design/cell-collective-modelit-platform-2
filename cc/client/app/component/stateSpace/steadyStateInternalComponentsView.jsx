import React from "react";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import Utils from "../../utils";
import Options from "../base/options";


class Content extends React.Component {
	render(){
		const props = this.props;
		return (
			<Panel {...props.view}>
				<Scrollable>
              
				</Scrollable>
			</Panel>
		);
	}
}

const Actions = () => {

	return {};
};

export default view(Content, null, Actions);