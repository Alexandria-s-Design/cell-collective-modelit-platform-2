import React from 'react';

import Panel from '../../client/app/component/base/panel';

class SinglePanelDemo extends React.Component {
	render() {
		const { view } = this.props;
		return <Panel className="magnify">
			<div style={{ 'fontSize': '12pt' }}>
				This a single panel. It spans the entire container.
				<br />
				Width: {view.parentWidth}px
				<br />
				Height: {view.parentHeight}px
			</div>
		</Panel>;
	}
}

export default {
	Component: SinglePanelDemo,
	title: "Single Panel",
	sourceKey: "singlePanel"
};