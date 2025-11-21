import React, { useState } from 'react';

import {
	connect
} from 'react-redux';

import {
	FormattedMessage
} from 'react-intl';

import {
	CCContextConsumer
} from '../../../containers/Application';
import Application from "../../../application";


import SignUp from '../../../component/dialog/signUp';
import SignIn from '../../../component/dialog/signIn';
import ImpersonateUser from '../../../component/dialog/impersonateUser';
import UserProfile from '../../../component/dialog/userProfile';
import ChangePassword from '../../../component/dialog/changePassword';
import CookiePolicy from '../../../component/dialog/cookieDialog';
import LanguageSelect from './LanguageSelect';
import ManageSubscription from '../ManageSubscription';
import AboutModal from './AboutModal';

import './styles.scss';

import messages from './messages';
import { isDevFeatureEnabled, PAYMENTS } from '../../../development/devFeatures';
import DomainSelection from '../IconBar/DomainSelection'
import Notfications from '../../../component/dialog/notifications/notifications';

const UserMenu = (props) => {
	const { user } = props;
	const [isShown, setIsShown] = useState(false);

	let styles = {};

	if (user && user.avatarUri) {
		styles = {
			borderRadius: "50%",
			width: "40px",
			height: "40px",
			backgroundImage: `url('${user.avatarUri}')`,
			backgroundSize: "40px 40px",
			backgroundPosition: "50% 50%"
		}
	}

	const isAdmin = () => {
		return user && user.userDomainAccess && user.userDomainAccess.admin === true
	}

	return (
		<CCContextConsumer>
			{({ cc }) => {
				return (
					<div className="icon large-account menu right topRightMenu" style={styles}
						onClick={(event) => setIsShown(current => !current)}
						onMouseEnter={() => setIsShown(true)}
						onMouseLeave={() => setIsShown(false)}>
						{isShown && <ul className="ul">
							{user ? (
								<React.Fragment>
									<li>
										<div onClick={() => cc.showDialog(UserProfile, {
											user: user,
											action: cc.userSave.bind(cc)
										})}><FormattedMessage {...messages.YourProfile} /></div>
									</li>
									{isDevFeatureEnabled(PAYMENTS) && (<li>
										<div onClick={() => cc.routerAccountUpgrade()}>
											<FormattedMessage {...messages.AccountUpgrade} /></div>
									</li>)}

									{isAdmin() && (
										<li>
											<div onClick={() => cc.showDialog(ImpersonateUser, {
												user: user,
												action: cc.userImpersonate.bind(cc),
											})}>
												Impersonate User
											</div>
										</li>
									)}
									<li>
										<div onClick={() => cc.showDialog(ChangePassword, null)}>
											<FormattedMessage {...messages.ChangePassword} /></div>
									</li>
									<li>
										<div id='user-notifications-menu-title' onClick={() => cc.showDialog(Notfications, {
											user: user
										})}>
											<FormattedMessage {...messages.Notifications} /></div>
									</li>
									<li>
										<div onClick={() => cc.showDialog(CookiePolicy, null)}>
											<FormattedMessage {...messages.CookieSettings} /></div>
									</li>
									<li>
										<div onClick={() => cc.userSignOut(cc)}>
											<FormattedMessage {...messages.SignOut} /></div>
									</li>
								</React.Fragment>
							) : (
								<React.Fragment>
									<li>
										<div onClick={() => cc.showDialog(SignIn, {
											action: !user && cc.userSignIn.bind(cc),
											forgotPassword: cc.userForgotPassword.bind(cc)
										})}>
											<FormattedMessage {...messages.SignIn} />
										</div>
									</li>
									<li>
										<div
											onClick={() => cc.showDialog(SignUp, { signInAction: !user && cc.userSignIn.bind(cc) })}>
											<FormattedMessage {...messages.SignUp} /></div>
									</li>
								</React.Fragment>
							)
							}
							<DomainSelection />
							{!Application.isModelIt && <><LanguageSelect /></>}

							{user && !(Application.domain === "research") && (
								<li>
									<div onClick={() => cc.showDialog(ManageSubscription, { _userData: user })}>
										<FormattedMessage {...messages.ManageSubscription} /></div>
								</li>
							)}
							{(
								<li>
									<div onClick={() => cc.showDialog(AboutModal, { entity: 'About' })}>
										<FormattedMessage id="about" defaultMessage="About" />
									</div>
								</li>
							)}
						</ul>}
					</div>
				);
			}}
		</CCContextConsumer>);
}

const mapStateToProps = state => ({
	user: state.auth.user
});

export default connect(mapStateToProps)(UserMenu);
