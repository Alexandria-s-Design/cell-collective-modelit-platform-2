import React from "react";
import Utils from "../../../utils";
import view from "../../base/view";
import { FormattedMessage, injectIntl } from "react-intl";
import messages from "./messages";

import { baseApiURL } from '../../../request';


class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
		this.onSubmit = this.onSubmit.bind(this);
	}
	
	onSubmit(e, d) {
		const { intl } = this.props;
		fetch(`${baseApiURL}/${e}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + this.props.user.token
			},
			body: JSON.stringify({ email: this.props.getDataForm(d).username, password: this.props.getDataForm(d).password })
		})
		.then (res => res.json())
		.then(({data: res, error}) => {	
			if (error) {
				throw new Error(error.errors[0].message);
			}
			this.props.action(this.props.getDataForm(d).username, res.access_token, res)
			this.props.onSubmit(null, this);
		}).catch(err => {
			const error = err.toString().split('Error:')[1].trim();
			if (!Utils.isEmail(this.props.getDataForm(d).username)) {
				this.setState({ error: intl.formatMessage(messages.ModelDashBoardModalSignInErrorPleaseUseEmailAddressToSignIn) })
			} else if (error.includes("Email or password is incorrect.") || error.includes('Invalid credentials.')) {
				this.setState({ error: intl.formatMessage(messages.ModelDashBoardModalSignInErrorIncorrectEmailPassword) })
			} else {
				this.setState({ error: err.message });
			}
		})
	}
	
	render() {
		const {  currMessage } = this.props;
		return (
			<form onSubmit={(e) => (e.preventDefault(), this.onSubmit(`api/auth/impersonate`, e))}>
				
				{currMessage || this.state.error ? <p className="alert-message danger">{currMessage || this.state.error}</p> : null}
				<input ref="email" name="username" autoComplete="email" placeholder="Email of user to impersonate" required/>
				
				<FormattedMessage id= "Dashboard.ModalSignIn.PasswordLabel" defaultMessage="Your Password"> 
					{x => <input type="password" name="password" autoComplete="current-password" placeholder={x} required/>}
				</FormattedMessage>


				<FormattedMessage id= "Dashboard.ModalSignIn.LabelSignIn" defaultMessage="Sign In">
					{x => (
						<button style={{
							"padding": "10px",
							"borderColor": "#fff",
							"borderRadius": "5px",
							"marginTop": "10px",
							"marginBottom": "10px",
							"backgroundColor": "#E67E22",
							"color": "#fff",
							"width": "100%"
						}} type="submit">
							{x}
						</button>
					)}
				</FormattedMessage>
			</form>
		);
	}
}

const translatedContent = injectIntl(Content)

const e = view(translatedContent);
e.width = 320;
e.height = 300;

export default e;
