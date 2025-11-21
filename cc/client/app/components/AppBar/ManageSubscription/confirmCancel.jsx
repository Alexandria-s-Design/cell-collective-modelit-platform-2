import React from "react";
import Utils from "../../../utils";
import view from "../../../component/base/view";
import { FormattedMessage, injectIntl } from "react-intl";
import messages from "./messages";
import { dateFormat } from "./../../../util/dateFormat";
import CancelSubscriptionState from "../../../entity/apiResponseState/CancelSubscriptionState";
import cc from '../../../cc';

class ConfirmCancelDialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {...props.subscriptionDatas, isCanceled: false};
	}

	handleOnConfirm() {
		const initState = new CancelSubscriptionState({...this.state});
		initState._loading = true;
		this.setState(initState);

		cc.request.post(`/api/manage-subscription/cancel`, {userId: initState.userId , customerSubscribedPlan : this.state.customerSubscribedPlan})
			.then(() => {
				const res = new CancelSubscriptionState({...initState});
				res._loading = false;
				res.isCanceled = true;
				this.setState(res);
			})
			.catch(err => {
				const res = {...this.state}
				res._loading = false;
				res._error = err.response ? err.response.data.error.errors[0].message : err.message;
				this.setState(res);
			});
	}

	render() {

		return (
			<div className="modalManageSubscription">
				{this.state._error && (<div className="error">{this.state._error}</div>)}
				{!this.state._loading ? (() => {
					if (this.state.isCanceled === true) {
						return <h3><FormattedMessage {...messages.CanceledMessage}/>.</h3>
					}
					return <React.Fragment>
						
						<h3><FormattedMessage {...messages.ConfirmContent}/>{this.state.customerSubscribedPlan.map(({userSubscription,expireOn}, idx) => (<div key={idx}>{userSubscription} on {expireOn}</div>))} </h3>
						<button
								onClick={this.handleOnConfirm.bind(this)}
								type="button"
								className="cancel">
								<FormattedMessage {...messages.ButtonConfirmCancel} />
						</button>
					</React.Fragment>
				})()
				: <div className="loading">Please, wait...</div>
				}
			</div>
		);
	}
}

const translatedContent = injectIntl(ConfirmCancelDialog)

const e = view(translatedContent);
e.width = 700;
e.height = 300;

export default e;