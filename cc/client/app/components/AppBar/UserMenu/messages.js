import { defineMessages } from "react-intl";

const URL = '@cc/cc/client/app/components/AppBar/UserMenu';

export default defineMessages({
    YourProfile: {
        id: `${URL}/YourProfile`,
        defaultMessage: 'Your Profile'
    },
    LanguageSelect: {
        id: `${URL}/LanguageSelect`,
        defaultMessage: 'Language'
    },
    ChangePassword:{
        id: `${URL}/ChangePassword`,
        defaultMessage: 'Change Password'
    },
		Notifications:{
			id: `${URL}/Notifications`,
			defaultMessage: 'Notifications'
		},
		CookieSettings:{
			id: `${URL}/CookieSettings`,
			defaultMessage: 'Cookie Settings'
		},
    AccountUpgrade:{
        id: `${URL}/AccountUpgrade`,
        defaultMessage: 'Account Upgrade'
    },
    SignOut: {
        id: `${URL}/SignOut`,
        defaultMessage: 'Sign Out'
    },
    SignIn: {
        id: `${URL}/SignIn`,
        defaultMessage: 'Sign In'
    },
    SignUp: {
        id: `${URL}/SignUp`,
        defaultMessage: 'Sign Up'
    },
		ManageSubscription: {
				id: `${URL}/ManageSubscription`,
        defaultMessage: 'Manage subscription'
		}
});