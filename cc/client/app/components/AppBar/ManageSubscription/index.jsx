import React from "react";
//import Utils from "../../../utils";
import view from "../../../component/base/view";
import { FormattedMessage, injectIntl } from "react-intl";
import messages from "./messages";
import { CCContextConsumer } from '../../../containers/Application';
import ConfirmCancelDialog from "./confirmCancel";
import SubscriptionState from "../../../entity/apiResponseState/SubscriptionState";
import UpgradeMenu from './../Upgrade/UpgradeMenu';
import cc from '../../../cc';
import './styles.scss';
import UserSession from "../../../entity/dataTransfer/UserSession";
import { dateFormat } from "./../../../util/dateFormat";


class ManageSubscriptionDialog extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = new SubscriptionState({_loading: true});
	}

	loadUserSubscription(user) {
		cc.request.get(`/api/manage-subscription/info?user_id=${user.id}`)
			.then(({data : subscriptionData}) => {
				const res = new SubscriptionState(subscriptionData.data);
				res._loading = false;
				this.setState(res);
			})
			.catch(err => {
				const res = {...this.state}
				res._loading = false;
				res._error = err.response ? err.response.data.error.errors[0].message : err.message;
				this.setState(res);
			});
	}

	componentDidMount() {
		const user = new UserSession(this.props._userData);
		this.loadUserSubscription(user);
	}

	render() {

		return (
			<CCContextConsumer>
				{({cc}) => (<div className="modalManageSubscription">
					{this.state._error && (<div className="error">{this.state._error}</div>)}
					{!this.state._loading ? 
					this.state.hasUserSubscription ?
						(
							<React.Fragment>
								<h3><ul>{this.state.customerSubscribedPlan.map(({userSubscription,expireOn}, idx) => (<li key={idx} ><span>{userSubscription} <FormattedMessage {...messages.ContentSubscription} />: {expireOn}</span></li>))}</ul></h3>
							<button
								type="button"
								className="cancel"
								onClick={() => cc.showDialog(ConfirmCancelDialog, {subscriptionDatas: {...this.state}})}>
								<FormattedMessage {...messages.ButtonCancel} />
							</button>
						</React.Fragment>
						)	: (
							<React.Fragment>
								<h3><FormattedMessage {...messages.ContentNoSubscription} /></h3>
								<button
								type="button"
								className="new"
								onClick={() => cc.showDialog(UpgradeMenu, null)}
								><FormattedMessage {...messages.ButtonViewFeatures} /></button>
							</React.Fragment>
							)
						: <div className="loading">Please, wait...</div>
					}
				</div>)}
			</CCContextConsumer>
		);
	}
}

const translatedContent = injectIntl(ManageSubscriptionDialog)

const e = view(translatedContent);
e.width = 700;
e.height = 250;

export default e;