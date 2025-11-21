import React from "react";
import { Seq } from "immutable";
import view from "../base/view";
import Options from "../base/options";

import { FormattedMessage } from "react-intl";

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: null
		}
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
	onChange(selection) {
		this.setState({
			selected: selection
		});
	}
	render() {
		const {prompt, values, onSubmit, get} = this.props;

		return (
			<form onSubmit={(e) => (e.preventDefault(), onSubmit(this.state.selected))}>
				<div className="content">
					{prompt}&nbsp;<Options value={this.state.selected} options={Seq(values)} get={get} onChange={this.onChange.bind(this)} />
				</div>
				{ onSubmit && <FormattedMessage id= "Dashboard.Options.OKLabel" defaultMessage="OK"> 
					{x => <input type="submit" value={x} disabled={this.state.selected === null} />}
				</FormattedMessage>}
				
			</form>);
	}
}

const e = view(Content);

e.width = 350;
e.height = 200;
export default e;