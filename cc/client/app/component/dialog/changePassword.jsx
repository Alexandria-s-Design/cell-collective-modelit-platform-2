import React from "react";
import view from "../base/view";
import { FormattedMessage } from "react-intl";
import { ccappRequest } from '../../request';

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = { error: null, success: null };
	}

	onSubmit(e, d) {
		ccappRequest.post(e, {
			cpassword: this.props.getDataForm(d).cpassword,
			vpassword: this.props.getDataForm(d).vpassword,
			password: this.props.getDataForm(d).password
		}).then(({ data }) => {
			if (data && data['data']) {
				this.setState(() => ({ error: null, success: data['data'].message }));
			}
		}).catch(err => {
			if ('response' in err) {
				this.setState(() => ({ error: err.response.data['data'].error, success: null }));
			} else {
				this.setState(() => ({ error: err.message, success: null }));
			}
		});
	}

	render() {
		return (
			<form onSubmit={(e) => (e.preventDefault(), this.onSubmit("/users/change-password", e))}>
				{this.state.success && (<div className="success">{this.state.success}</div>)}
				<FormattedMessage id= "Dashboard.CurrentPassword.CurrentPasswordLabel" defaultMessage="Current Password"> 
					{x => 	<input type="password" name="cpassword" autoComplete="current-password" placeholder={x} minLength="8"/>}
				</FormattedMessage>

				<FormattedMessage id= "Dashboard.NewPassword.NewPasswordLabel" defaultMessage="New Password"> 
					{x => <input type="password" name="password" autoComplete="new-password" placeholder={x} minLength="8"/>}
				</FormattedMessage>

				<FormattedMessage id= "Dashboard.VerifyPassword.VerifyPasswordLabel" defaultMessage="Verify Password"> 
					{x => <input type="password" name="vpassword" autoComplete="new-password" placeholder={x} minLength="8"/>}
				</FormattedMessage>
				
				<FormattedMessage id= "Dashboard.ChangePassword.ChangePasswordLabel" defaultMessage="Change Password"> 
					{x =><input type="submit" value={x}/>}
				</FormattedMessage>
				{this.state.error && (<div className="error">{this.state.error}</div>)}
			</form>
		);
	}
}

const e = view(Content);
e.width = 240;
e.height = 239;

export default e;