import React from 'react';
// import React, {useEffect, useState} from "react";
import { FormattedMessage } from 'react-intl';
import "../../styles.scss";
import basicPlan from './basicPlan.json';
import premiumPlan from './premiumPlan.json';
import classNames from 'classnames';
import buttons from './buttons.json';
import e from '..';

class BasicPremiumModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			error: null };
  }


  render() {


    return (
			<div>
				<table className="upgrade-table">
							<tr>
								<th><h6 className="upgrade-items-center sub-column-header"> <FormattedMessage id="ModelDashBoard.BasicPremium.ModelUpgradeMenu.BasicAccess" defaultMessage="Basic Access" /> </h6></th>
								<th><h6 className="upgrade-items-center sub-column-header"><FormattedMessage id="ModelDashBoard.ModelUpgradeMenu.PremiumAccess" defaultMessage="Premium Access" /></h6></th>
							</tr>
							<tr>
								<td className="basicPlan-top align"><ul>{basicPlan.map(({desc}) => (<li><span>{desc}</span></li>))}</ul></td>
								<td className="basicPlan-top"><ul>{basicPlan.map(({desc}) => (<li><span>{desc}</span></li>))}
									{premiumPlan.map(({desc}) => (<li className="premium"><span>{desc}</span></li>))}</ul>
								</td>
							</tr>
							<tr style={{ background: "lightgrey", borderRadius: "5px"}}>
								{buttons.map(({id, button,price,name}) => (
									<td>
										<button id={id}
										onClick={() => {this.props.bpHandleTab(`${id}`,`${button}`,`${price}`,`${name}`)}}
										className={classNames({"tabs" : true, "active-tabs" : this.props.bpToggleState === `${id}`,"align-right" : `${id}` == 2})}>{button} 
									</button>
									</td>
								))}
							</tr>
				</table>
			</div>
    );
  }
}

export default BasicPremiumModule;