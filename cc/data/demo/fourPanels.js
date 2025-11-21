import React from 'react';
import Panel from '../../client/app/component/base/panel';

class FourPanelDemo extends React.Component {
	render() {
		return <>
			<Panel width="50%" height="50%" className="magnify">
				<div>This is a panel on the top-left.</div>
			</Panel>
			<Panel left="50%" width="50%" height="50%" className="magnify">
				<div>This is a panel on the top-right.</div>
			</Panel>
			<Panel top="50%" width="50%" height="50%" className="magnify">
				<div>This is a panel on the bottom-left.</div>
			</Panel>
			<Panel top="50%" left="50%" width="50%" height="50%" className="magnify">
				<div>This is a panel on the bottom-right.</div>
			</Panel>
		</>
	}
}

export default {
	Component: FourPanelDemo,
	title: "Four Panels",
	sourceKey: "fourPanels"
}