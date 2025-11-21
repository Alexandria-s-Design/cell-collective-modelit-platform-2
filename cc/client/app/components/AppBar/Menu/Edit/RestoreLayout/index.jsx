import React from "react";
import BaseMenu from "../../../BaseMenu";
import messages from "../messages";
import { FormattedMessage } from 'react-intl';

const RestoreLayout = (props) => {
	let { cc } = props;
	return <BaseMenu title={<FormattedMessage {...messages.RestoreLayout} />}
		content={
			<ul>
				<li>
					<div onClick={() => {
						cc.layoutRestore(false);
					}}>
						<FormattedMessage {...messages.FromDefault} />
					</div>
				</li>
				<li>
					<div onClick={() => {
						cc.layoutRestore(true);
					}}>
						<FormattedMessage {...messages.FromModel} />
					</div>
				</li>
			</ul>
		}
	/>
}

export default RestoreLayout;
