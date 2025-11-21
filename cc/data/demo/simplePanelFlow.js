import React from 'react';
import Panel from '../../client/app/component/base/panel';
import { PanelFlow } from '../../client/app/component/base/panelLayout';

class SimplePanelFlow extends React.Component {
	render() {
		// Simple Panel Flow
		const { view } = this.props;
		return <PanelFlow view={view}>
			<Panel className="magnify">
				<div>This is a panel flow.</div>
			</Panel>
			<Panel className="magnify">
				<div>This is the second panel in the flow!</div>
			</Panel>
			<Panel layoutHeight={100} className="magnify">
				<div>This panel takes up 100px of height in the layout.</div>
			</Panel>
			<Panel className="magnify">
				<div>This is the bottom panel.</div>
			</Panel>
		</PanelFlow>;
	}
}

export default {
	Component: SimplePanelFlow,
	title: "Simple Panel Flow",
	sourceKey: "simplePanelFlow"
}