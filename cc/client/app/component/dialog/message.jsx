import React from "react";
import view from "../base/view";

import { FormattedMessage } from "react-intl";

class Content extends React.Component {
	constructor(props) {
		super(props);
	}
	UNSAFE_componentWillMount() {
		document.addEventListener("keyup", this.dialogKeyUp = this.dialogKeyUp.bind(this));
	}
	dialogKeyUp(e){
		(e.which || e.keyCode) == 13 && this.props.onSubmit(null, this);
	}
	componentWillUnmount() {
		document.removeEventListener("keyup", this.dialogKeyUp);
	}
	render() {
		const {message, onSubmit} = this.props;

		return (
			<form onSubmit={(e) => (e.preventDefault(), onSubmit(null, this, e))}>
				<div className="content">{message}</div>
				{ onSubmit && <FormattedMessage id="Dashboard.Message.OK.OKLabel" defaultMessage="OK"> 
					{x => <input type="submit" value={x}/>}
				</FormattedMessage>}
				
			</form>);
	}
}

const e = view(Content);

e.width = 240;
e.height = 174;

export const MessageContent = Content;
export default e;