import React from 'react';
import {injectIntl} from 'react-intl';
import classnames from 'classnames';

import { FormattedMessage } from 'react-intl';
import "../../../styles.scss";
import customerSupportList  from './customerSupportList.json';


class StudentRangeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			error: null};
  }

	render(){
		return(
			<div className="radio-square">
				{
					customerSupportList.map(({id, displayName, price, name }) => (
						<li key={price} style={{'list-style':'none'}}>
							<label className="con1">
								<span>{displayName}</span>
									<input type="radio" value={price} name="studentCountRangeSelection"  onClick={() => {this.props.setStudentRangList(id, displayName, price, name) }}/> 		
								<span className="checkmark-radio"></span>		
							</label>
						</li>																	
					))
				}
		</div>
		);
	}
}

export default StudentRangeList;