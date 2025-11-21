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
		(e.which || e.keyCode) == 13 && (this.props.action(), this.props.onClose());
	}
	componentWillUnmount() {
		document.removeEventListener("keyup", this.dialogKeyUp);
	}
	render() {
		const {type, entity, action, onClose, onCancel, message, okText, cancelText, cancelStyle} = this.props;
        
		return (
			<form onSubmit={(e) => (action(), onClose(), e.preventDefault(), false)}>
				<div className="default-dialog content">
					{
						message ? message : 
							<FormattedMessage id="DashBoard.ModalConfirmation.LabelConfirmation"
								defaultMessage="Do you really want to {action} {entity}?"
								values={{
									action: (e.messages[type] || (type + " ")),
									entity: (entity ? entity : "")
								}}/>
					}
				</div>
				<input className="no-hover" type="button" value={cancelText || "Cancel"} style={cancelStyle || {}}
					onClick={()=>(onCancel && onCancel(), onClose(), false)}/>
				<input type="submit" value={okText || "OK"} onClick={()=>false}/>
			</form>);
	}
}

const e = view(Content);
e.width = 240;
e.height = 174;
e.messages = { close: "close this Panel" };

export default e;