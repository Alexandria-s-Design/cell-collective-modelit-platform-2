import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { getModelView } from "../../../containers/Model/actions";
import { FormattedMessage } from 'react-intl';

import messages from './messages';
import './style.scss';


import showMessage, { TYPE_ERROR, TYPE_SUCCESS, TYPE_WARNING } from '../../../message';

// import {
// 	CCContextConsumer
// }                                   from '../../../containers/Application';
// import view from '../../base/view';

const CURRENCY = 'USD';
const SUBSCRIPTION_PERIOD_IN_DAYS = 180;


import {
  doPlanSubscribe
} from '../../../reducers/auth/actions';
import { useDispatch, useSelector } from 'react-redux';

const fromUSDToCent = amount => amount * 100;

const dialogStyle = {
  width: '500px',
  maxWidth: '100%',
  margin: '0 auto',
  position: 'fixed',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: '999',
  backgroundColor: '#000000',
  padding: '10px 20px 40px',
  borderRadius: '8px',
  borderColor: '#d6d7da',
  display: 'flex',
  flexDirection: 'column'
};

const buttonLayout  = {
  backgroundColor:'white',
  borderRadius: '8px',
  borderColor: '#d6d7da'
};

const AccountLoadingSpinner = () => (
	<div style = {dialogStyle}>
		<h1> <strong className="fa-fa-spinner fa-spin" ><FormattedMessage {...messages.SpinnerInfo}/></strong></h1>
	</div>
);


const showToast = (type, msg) => {
	showMessage({
		message: msg,
		type: type,
		options: {
			extendedTimeOut: 30000,
			timeOut: 60000,
		},
	});
};

const planViewModel = getModelView("plan");

export let user = null;

const AccountUpgrade = ({bpPlan,csPlan, pdPlan, usaPlan , studentCount, sum}) => {
	const dispatch = useDispatch();
	user = useSelector(state => state.auth.user);
	const authIsLoading = useSelector(state =>state.auth.loading);
	const plans = planViewModel.useListWithData();

  const createCheckoutButton = () => {
		if(!user)
			{console.warn("User is not defined");}
		const {email, subscription} = user || {};
    return (
			<StripeCheckout
				amount={fromUSDToCent(sum)}
				token={(token) => dispatch(doPlanSubscribe(token, bpPlan, csPlan, pdPlan, usaPlan, studentCount, sum * 100))}
				currency={CURRENCY}
				stripeKey={import.meta.env.VITE_STRIPE_KEY}
				>
				<button id="1" className=' checkout action-btn'> <FormattedMessage id="ModelDashBoard.ModelUpgradeMenu.Checkout" defaultMessage="Checkout"/> </button>
			</StripeCheckout>			
			);
  };
	return  (
			<div>
				{createCheckoutButton()} 
			</div>
	);
}

export default AccountUpgrade;
