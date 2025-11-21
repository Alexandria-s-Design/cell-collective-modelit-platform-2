import React from 'react';
import { FormattedMessage } from 'react-intl';
import "../../styles.scss";
import upgradeStudentAccountsList from './upgradeStudentAccountsList.json';
import buttons from './buttons.json';

const min_Student = 0;
const max_Student = 500;

const variableButtonPriceId = 2;

class UpgradeStudentsAccountsModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			error: null ,
			minStudent : min_Student,
			maxStudent : max_Student,
			buttonId : variableButtonPriceId
		};
  }
	
  render() {
    return (
			<div>
				<h6 className="upgrade-items-center"> <FormattedMessage id="ModelDashBoard.ModelUpgradeMenu.UpgradeStudentAccounts" defaultMessage="Upgrade Student Accounts" /> </h6>
				<table className="upgrade-table">
							<tr><td className="basicPlan-top"><ul>{upgradeStudentAccountsList.map(({desc}) => (<li><span>{desc}</span></li>))}</ul></td></tr>
							<tr>
								<div className="studentCountLabel">
									<input name="NoOfStudentAccountPurchase" className="studentCount" type="number"  max = {this.state.maxStudent}  min = {this.state.minStudent} defaultValue={this.state.minStudent} 
									value={this.props.studentCount} onChange={this.props.countOfStudentAccountPurchase}
									/>
									<FormattedMessage id="ModelDashBoard.Upgrade.NoOfStudentAccountPurchase" defaultMessage="How many student account do you want to purchase?" />		
								</div>
							</tr>
							<tr style={{ background: "lightgrey", borderRadius: "5px"}}>	
								{buttons.map(({id, button,price,name}) => (
									<td>
										<button id={id}
										onClick={() => {this.props.usaHandleTab(`${id}`,`${button}`,`${price}`,`${name}`)}}
										className={this.props.usaToggleState === `${id}` ? "tabs active-tabs" : "tabs"} > {button} 
									</button>
									</td>
								))}

								<td>
									<button id={this.state.buttonId}
										className={this.props.usaToggleState === this.state.buttonId ? "tabs active-tabs" : "tabs"}> ${this.props.usaPrice} /180 days
									</button>
								</td>

							</tr>
				</table>
			</div>
    );
  }
}

export default UpgradeStudentsAccountsModule;