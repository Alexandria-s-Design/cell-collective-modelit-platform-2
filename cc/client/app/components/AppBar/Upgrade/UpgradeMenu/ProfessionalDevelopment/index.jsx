import React from 'react';
import { FormattedMessage } from 'react-intl';
import "../../styles.scss";
import professionalDevelopment from './professionalDevelopment';
import professionalDevelopmentList from './professionalDevelopment.json';
import buttons from './buttons.json';

class ProfessionalDevelopmentModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			error: null};
  }

  render() {
    return (
			<div>
				<h6 className="upgrade-items-center"> <FormattedMessage id="ModelDashBoard.ProfessionalDevelopment.ModelUpgradeMenu.BasicAccess" defaultMessage="Professional Development" /> </h6>
				<table className="upgrade-table">
							<tr><div className="textCenter">{professionalDevelopment}</div></tr>
							<tr><td className="basicPlan-top"><ul className="nobullet">{professionalDevelopmentList.map(({desc}) => (<li><span>{desc}</span></li>))}</ul></td></tr>
							<tr style={{ background: "lightgrey", borderRadius: "5px"}}>
									{buttons.map(({id, button, price,name}) => (
										<td>
											<button id={id}
											onClick={() => {this.props.pdHandleTab(`${id}`,`${button}`,`${price}`,`${name}`)}}
											className={this.props.pdToggleState === `${id}` ? "tabs active-tabs" : "tabs"}>
											{button} 
										</button>
										</td>
									))}
								</tr>
				</table>
			</div>
    );
  }
}

export default ProfessionalDevelopmentModule;