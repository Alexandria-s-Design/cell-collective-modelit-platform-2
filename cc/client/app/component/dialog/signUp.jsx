import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Seq } from 'immutable';

import { CourseDisplayInput } from '../../containers/teach/course/Components';

import TermsOfService from './tos';
import view from '../base/view';
import Scrollable from '../base/scrollable';
import Checkbox from '../base/checkbox';
import Utils from '../../utils';
import Application from '../../application';
import cc from '../../cc';

import InstitutionInput from './inputs/institution';
import Social from "./Social";

const lineify = text => text.split('\n').map(para => <p>{para}</p>);
class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.courseDisplayInput = React.createRef();
		this.onSignup = this.onSignup.bind(this);
  }
  onSubmit(e, d) {
    const token = e.getResponseHeader('X-AUTH-TOKEN');
    if (token) {
      this.props.action(d.username, token);
      this.props.onSubmit(null, this);
    }
  }

	async trySignIn(token, user, res){
		try {
			await this.props.signInAction(user.username, token, res);
			await this.props.onSubmit(null, this);
		} catch (e) {
			
			this.setState({error: e})
			return;
		}
	}

  async onSignup(e) {
    e.preventDefault();

		const messageUserExist = 'This email is already registered. Please try logging in instead.';
		const _email = this.props.getDataForm(e).email;

		try {
			const response = await fetch(`${Application.api}/api/users/validate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ email: _email }),
			});
			if (!response.ok) {
				throw new Error(messageUserExist);
			}
			const data = await response.json();
		} catch (error) {
			console.error(error);
			this.setState({error: error.message});
			return null;
		}

    this.props.onSubmitPromise(
			'users/register',
      this,
      e,
      async res => {
				if(res.data.error){
					throw new Error(res.data.error)
				}
        const user = res.data.user;
				user.avatarUri= res.data.profile.avatar_uri
				user.name = res.data.user.username

				const _password = this.props.getDataForm(e).password;

				fetch(`${Application.api}/api/users/register`,{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
				 }, 
				 body: JSON.stringify({
						email: user.email,
						password: _password,
						vpassword: this.props.getDataForm(e).vpassword,
						firstName: this.props.getDataForm(e).first_name,
						lastName: this.props.getDataForm(e).last_name,
						institution: this.props.getDataForm(e).institution || 'UNL',
						ccappUserId: res.data.profile.user.id
				})
				})
				.then(r => r.json())
				.then(({ data: response }) => {
						
					fetch(`${Application.api}/api/auth/login`,{
						method: 'POST',
						headers: {
						 'Content-Type': 'application/json',
						 'Accept': 'application/json',
					 }, 
					 body: JSON.stringify({email: user.email, password: _password})
					})
					.then(r => r.json())
					.then(({ data: response, error }) => {
							if (error && error.errors) {								
								this.setState({error: messageUserExist});
							}
							if (response) {
								const token = response['access_token'];
								if(token){
									this.trySignIn(token, user, response)
								}
							}							
					}).catch(e =>  {
						this.setState({error: e})
					});

				}).catch(e =>  {
					this.setState({error: e})
				})
				
        if (this.courseDisplayInput.current) {
          await this.courseDisplayInput.current.enrollCourse(user.id);
        }

        return res;
      },
      err => {
        const error = err.toString().split('Error:')[1].trim();;
				
        this.setState({ error: error });
      },
			true
    );
	}
	
  onChangeCodeKey(event) {
    event.persist();
    const inputVal = event.target.value;
    if (inputVal.length == 8) {
      this.getCourseByCodeKey(inputVal);
    } else {
      this.setState({course: null, courseError: null});
    }
  }
	
  render() {
		const { onSocialSignUp } = this;

    const tosHeight = this.state.error ? '230px' : '290px';
    return (
			<form className="row-2" onSubmit={this.onSignup}>
				<FormattedMessage id="ModelDashBoard.SignUpModal.LabelEmail" defaultMessage="Email">
					{x => <input type="email" name="email" autoComplete="email" placeholder={x} tabIndex="1" />}
				</FormattedMessage>
				<FormattedMessage id="ModelDashBoard.SignUpModal.LabelFirstName" defaultMessage="First Name">
					{x => <input type="text" name="first_name" placeholder={x} tabIndex="4" />}
				</FormattedMessage>
				<FormattedMessage id="ModelDashBoard.SignUpModal.LabelPassword" defaultMessage="Password">
					{x => <input type="password" name="password" autoComplete="new-password" placeholder={x} tabIndex="2" minLength="8"/>}
				</FormattedMessage>
				<FormattedMessage id="ModelDashBoard.SignUpModal.LabelLastName" defaultMessage="Last Name">
					{x => <input type="text" name="last_name" placeholder={x} tabIndex="5" />}
				</FormattedMessage>
				<FormattedMessage id="ModelDashBoard.SignUpModal.LabelVerifyPassword" defaultMessage="Verify Password">
					{x => <input type="password" name="vpassword" autoComplete="new-password" placeholder={x} tabIndex="3" minLength="8"/>}
				</FormattedMessage>
				<FormattedMessage id="ModelDashBoard.SignUpModal.Username" defaultMessage="Username">
					{x => <input type="text" name="username" autoComplete="username" placeholder={x} tabIndex="6" />}
				</FormattedMessage>
				<InstitutionInput />
				{/* <FormattedMessage id="ModelDashBoard.SignUpModal.LabelSignUp" defaultMessage="Sign Up">
					{x => <input type="submit" value={x} disabled={Utils.enabled(this.state.accepted)} />}
				</FormattedMessage> */}
				{Application.domain == 'learning' && (
					<div style={{ marginTop: '10px' }}>
						{'Optional course code: '}
						<CourseDisplayInput ref={this.courseDisplayInput} />
					</div>
				)}
				{this.state.error ? <div className="error">{this.state.error}</div> : null}
				<div className="terms-of-service" style={{ height: tosHeight, marginTop: "10px", marginBottom: "10px" }}>
					<Scrollable parentHeight={290} scrollSpeed={2}>
						<div>{lineify(TermsOfService)}</div>
					</Scrollable>
				</div>

				<Checkbox value={this.state.accepted} onEdit={e => this.setState({ accepted: e })} />
				<span>
					<FormattedMessage id="ModelDashBoard.SignUpModal.LabelAcceptTerms" defaultMessage="I accept these terms of use." />
				</span>

				<FormattedMessage id= "Dashboard.ModalSignIn.LabelSignUp" defaultMessage="Sign Up">
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
						}} type="submit" disabled={Utils.enabled(this.state.accepted)}>
							{x}
						</button>
					)}
				</FormattedMessage>

				<FormattedMessage id="ModelDashBoard.SignUpModal.LabelSocial" defaultMessage="Sign Up with ">
					{x => <Social prefix={x}/>}
				</FormattedMessage>

			</form>
    );
  }
}

const e = view(Content);
e.width = 472;
e.height = 760;

export default e;