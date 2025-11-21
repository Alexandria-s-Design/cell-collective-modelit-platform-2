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
		const {title, message, onSubmit} = this.props;

		return (
				<form onSubmit={(e) => (e.preventDefault(), onSubmit(null, this, e))}>
					<div className="content">{message}</div>
					{ onSubmit
						&& <FormattedMessage id= "Dashboard.OK.OKLabel" defaultMessage="OK"> 
						{x => <input type="submit" value={x}/>}
					</FormattedMessage>}
				</form>);
	}
}

const Header = props => {
	return props.barTitle;
};

const e = view(Content, Header);

e.width = 240;
e.height = 180;

export const InformContent = Content;
export default e;