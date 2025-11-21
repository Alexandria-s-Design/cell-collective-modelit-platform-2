import React from 'react';
import classNames from 'classnames';

import { CCContextConsumer } from '../../../../containers/Application';


import { FormattedMessage } from 'react-intl';

import messages from './messages';
import menuMessages from '../messages';
import RestoreLayout from "./RestoreLayout";
import BaseMenu from "../../BaseMenu";
import Application from '../../../../application';

export default () => {

	return <BaseMenu title={<FormattedMessage {...menuMessages.Edit} />}
		content={<CCContextConsumer>
			{({ cc, model }) => (
				<ul>
					<li className={classNames(!model.history || !model.history.undoable && "disabled")}>
						<div onClick={() => {
							model.history && model.history.undoable && cc.historyMove('undo');}}>
							<FormattedMessage {...messages.Undo} />
						</div>
					</li>
					<li className={classNames(!model.history || !model.history.redoable && "disabled")}>
						<div onClick={() => {model.history && model.history.redoable && cc.historyMove('redo');}}>
							<FormattedMessage {...messages.Redo} />
						</div>
					</li>
					{model.isPublic || Application.isTeach ? null : <RestoreLayout/>}
				</ul>
			)}
		</CCContextConsumer>} />
}
