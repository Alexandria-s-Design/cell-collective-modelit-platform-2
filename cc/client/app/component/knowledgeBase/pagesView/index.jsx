import React from 'react';
import { Seq } from 'immutable';
import view from '../../base/view';
import Panel from '../../base/panel';
import Table from '../../base/table';
import messages from './messages';

export const handleSelect = (e, actions) => {
	const regs = (e.downStreams != undefined) ? Seq(e.downStreams).toArray() : [];
	actions.onSubSelect(e, regs)
	return e;
};

const PageComponent =  ({ intl, view, model, persisted, entities, selected: { Component: e }, actions }) => {
	return ( 
		<Panel {...view} className="bar">
			<Table
				{...actions}
				onDrag={null}
				persisted={persisted.Component}
				references={[entities.get('Component')]}	
				owner={model}
				selected={e}
				onSelect={(e) => handleSelect(e, actions)}
				data={Seq(model.Component)}
				search="name"
				columns={[{ get: 'name', label: intl.formatMessage(messages.ModelDashBoardPagesViewLabelName) }]}
			></Table>
		</Panel>
	);
};

export default view(PageComponent, 'Components');
