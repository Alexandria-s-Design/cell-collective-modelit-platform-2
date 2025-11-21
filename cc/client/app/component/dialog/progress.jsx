import React from "react";
import view from "../base/view";

class Content extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const {waitMessage, title} = this.props;
		return (<form>
			<div className="content dialog">
				{title ? <h3 className="dialog-title">{title}</h3> : null}
				<div className="circles-progress"><span className="message">{waitMessage}</span></div>
			</div>
		</form>);
	}
}

const e = view(Content);

e.width = 240;
e.height = 174;

export const MessageContent = Content;
export default e;