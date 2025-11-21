import React from 'react';
import { FormattedMessage } from 'react-intl';
import "../../styles.scss";
import customerSupport from './customerSupport';
import StudentRangeList from './StudentRangeSelect/index';
import buttons from './buttons.json';

const variableButtonPriceId = 2;

class CustomerSupportModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			error: null, 
			buttonId : variableButtonPriceId
		};
  }

  render() {

    return (
			<div>
				<h6 className="upgrade-items-center"><FormattedMessage id="ModelDashBoard.ModelUpgradeMenu.CustomerSupport" defaultMessage="Customer Support"/> </h6>
				<table className="upgrade-table">
							<tr><div className="textCenter"> {customerSupport}</div></tr>
							<tr><StudentRangeList setStudentRangList={this.props.setStudentRangList}/></tr>
							<tr style={{ background: "lightgrey", borderRadius: "5px"}}>
									{buttons.map(({id, button,price, name}) => (
										<td>
											<button id={id}
											onClick={() => {this.props.csHandleTab(`${id}`,`${button}`,`${price}`,`${name}`)}}
											className={this.props.csToggleState == `${id}` ? "tabs active-tabs" : "tabs"}> {button} 
											</button>
										</td>
									))}
										<td>
											<button id={this.state.buttonId}
												className={this.props.csToggleState === this.state.buttonId ? "tabs active-tabs" : "tabs"}> ${this.props.csPrice} /Year
											</button>
										</td>
							</tr>
				</table>
			</div>
    );
  }
}

export default CustomerSupportModule;