import { defineMessages } from "react-intl";

const URL = '@cc/cc/client/app/components/AppBar/ManageSubscription';

export default defineMessages({
	ContentSubscription: {
			id: `${URL}/ContentSubscription`,
			defaultMessage: "subscription active through"
    },
		ButtonCancel: {
			id: `${URL}/ButtonCancel`,
			defaultMessage: "Cancel subscription"
		},
		ConfirmContent: {
			id: `${URL}/ConfirmContent`,
			defaultMessage: "Are you sure you want to cancel your subscription? You will lose access to features for"
		},
		CanceledMessage: {
			id: `${URL}/CanceledMessage`,
			defaultMessage: "Your subscription has been canceled"
		},
		ButtonConfirmCancel: {
			id: `${URL}/ButtonConfirmCancel`,
			defaultMessage: "Confirm Subscription Cancellation"
		},
		ContentNoSubscription: {
			id: `${URL}/ContentNoSubscription`,
			defaultMessage: "You have no active subscriptions"
		},
		ButtonViewFeatures: {
			id: `${URL}/ButtonViewFeatures`,
			defaultMessage: "View Premium Features"
		}
})