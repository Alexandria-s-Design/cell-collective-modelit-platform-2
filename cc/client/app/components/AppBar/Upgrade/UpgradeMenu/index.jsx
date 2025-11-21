import React from 'react';
import { FormattedMessage } from 'react-intl';
import view from '../../../../component/base/view';
import Application from '../../../../application';
import StripeCheckout from 'react-stripe-checkout';
import messages from '../messages';
import BasicPremiumModule from './BasicPremium/index';
import CustomerSupportModule from './CustomerSupport/index';
import ProfessionalDevelopmentModule from './ProfessionalDevelopment/index';
import UpgradeStudentsAccountsModule from './UpgradeStudentAccount/index';
import Scrollable from '../../../../component/base/scrollable';
import "../styles.scss";

import Checkout from '../../../../component/learning/accountUpgrade';


// import cc from '../../../../cc';
// import OptionsDialog from '../../../../component/dialog/options';


const MIN_VAL= '0';
const INITIAL_TOGGLE_STATE = '1';
const BUTTON_NAME= "No Thanks";
const BASIC_BUTTON= "Keep Basic Access";
const MIN_STUDENT_ACCOUNT_PURCHASE = 1;
const min_Student = 0;
const max_Student = 500;
const usaPlan = 'UpgradeStudentAccountPlan';
const button2_initialPrice=59;


const CURRENCY = 'USD';
const SUBSCRIPTION_PERIOD_IN_DAYS = 180;


class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			error: null,
			totalSum: 0,
			
			bpToggleState: INITIAL_TOGGLE_STATE,
			bpTabName: BASIC_BUTTON,
			bpPrice : MIN_VAL,
			bpPlan : '0',

			csToggleState: INITIAL_TOGGLE_STATE,
			csTabName: BUTTON_NAME,
			csPrice : MIN_VAL ,
			csPlan : '0',

			usaToggleState: INITIAL_TOGGLE_STATE,
			usaTabName: BUTTON_NAME,
			usaPrice : MIN_VAL, 
			studentCount : '0',
			usaPlan : '0',

			pdToggleState: INITIAL_TOGGLE_STATE,
			pdTabName: BUTTON_NAME,
			pdPrice : MIN_VAL,
			pdPlan : '0',

		};
		this.bpHandleTab = this.bpHandleTab.bind(this);
		this.csHandleTab = this.csHandleTab.bind(this);
		this.pdHandleTab = this.pdHandleTab.bind(this);
		this.usaHandleTab=this.usaHandleTab.bind(this);
		this.setStudentRangList = this.setStudentRangList.bind(this);
		this.countOfStudentAccountPurchase = this.countOfStudentAccountPurchase.bind(this);
  }


	countOfStudentAccountPurchase = (event) =>{
		let val = event.target.value;
		if(val<=500){
			if(val >=1 ){
				const updatedPrice= button2_initialPrice * val;
				this.setState({
					studentCount :  Number(event.target.value),usaPrice: updatedPrice,usaToggleState: 2, usaPlan : usaPlan
				});	
			}
			
		}

	}

	setStudentRangList = (index, button, price, name) => {
		this.setState({ csToggleState: index, csTabName: button, csPrice: price, csPlan: name});
	}

	bpHandleTab = (index, button,price, name) => {
		this.setState({bpToggleState: index, bpTabName: button, bpPrice: price, bpPlan: name})
	}

	csHandleTab = (index, button,price,name) => {
		this.setState({csToggleState: index, csTabName: button, csPrice: price, csPlan: name})
	}

	pdHandleTab = (index, button,price, name) => {
		this.setState({pdToggleState: index, pdTabName: button,pdPrice: price, pdPlan: name})
	}

	usaHandleTab = (index, button, price, name) => {
		if(index != INITIAL_TOGGLE_STATE && (this.state.studentCount == '0'  || this.state.studentCount == 0)){	
			const updatedPrice= button2_initialPrice * MIN_STUDENT_ACCOUNT_PURCHASE;
			this.setState({studentCount: MIN_STUDENT_ACCOUNT_PURCHASE})
			this.setState({usaToggleState: index,usaTabName: button,usaPrice: updatedPrice, usaPlan: name})
		}else{
			this.setState({usaToggleState: index,usaTabName: button,usaPrice: price, usaPlan: name})
		}
	}

  render() {
		let sum = Number(this.state.bpPrice) + Number(this.state.csPrice) + Number(this.state.pdPrice) + Number(this.state.usaPrice);
		const fromUSDToCent = amount => amount * 100;

		const tosHeight = '800px';
    return (
			<div className="upgradeMenu scroll">
				<Scrollable parentHeight={600} scrollSpeed={2} >
					<div>
								<h5 className="upgrade-items-center">UNLOCK THE FULL INSTRUCTOR EXPERIENCE</h5>	

								{Application.domain == 'learning' && <>
										<BasicPremiumModule bpHandleTab={this.bpHandleTab} bpToggleState={this.state.bpToggleState}/>
								</>}

								{Application.domain == 'teaching' && <>
										<BasicPremiumModule bpHandleTab={this.bpHandleTab} bpToggleState={this.state.bpToggleState}/>
										<CustomerSupportModule csHandleTab={this.csHandleTab} setStudentRangList={this.setStudentRangList}
											csToggleState={this.state.csToggleState}  csPrice={this.state.csPrice} />
										<ProfessionalDevelopmentModule pdHandleTab={this.pdHandleTab} pdToggleState={this.state.pdToggleState}/>
										<UpgradeStudentsAccountsModule usaHandleTab={this.usaHandleTab} countOfStudentAccountPurchase={this.countOfStudentAccountPurchase}
												studentCount={this.state.studentCount} usaToggleState={this.state.usaToggleState} usaPrice={this.state.usaPrice}/>
								</>}
								<div className="studentCountLabel">
									<td className="upgrade-items-center totalSumLabel"><FormattedMessage id="ModelDashBoard.ModelUpgradeMenu.TotalSum" defaultMessage="Total : $" />{sum}</td>
								</div>
										<Checkout bpPlan={this.state.bpPlan} csPlan={this.state.csPlan} pdPlan={this.state.pdPlan} usaPlan={this.state.usaPlan}  studentCount={this.state.studentCount} sum={sum}/>
					</div>
				</Scrollable>
			</div>

			
    );
  }
}

const e = view(Content);

if (Application.domain == 'learning') {
  e.width = 800;
  e.height = 400;
}
if (Application.domain == 'teaching') {
  e.width = 800;
  // e.height = 950;
	e.height = 700;
} 
export default e;
