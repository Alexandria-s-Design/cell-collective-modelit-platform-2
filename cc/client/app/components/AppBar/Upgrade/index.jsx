import React, {Component} from 'react'
import UpgradeMenu from './UpgradeMenu/index';
import {FormattedMessage} from 'react-intl';
import {CCContextConsumer } from '../../../containers/Application';
import messages from './messages';
import "./styles.scss";


class Upgrade extends Component{

	render () {
		return (
				<CCContextConsumer scrollable={true}>
					{ ({cc}) => {
					return (
					<div><div className="upgrade-btn right-upgrade"  onClick={() => cc.showDialog(UpgradeMenu,null)}><FormattedMessage {...messages.Upgrade} /></div></div>	);}}
				</CCContextConsumer>);
	}
}
export default Upgrade;
