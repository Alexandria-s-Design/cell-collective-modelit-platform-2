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
					<div className="simulation control">
						<input type="button" className={"icon large-" + "run"} />
					</div>
				</Scrollable>
			</Panel>
		);
	}
}

const Actions = () => {

	return { download: () => Utils.downloadFile("")};
};

export default view(Content, null, Actions);
