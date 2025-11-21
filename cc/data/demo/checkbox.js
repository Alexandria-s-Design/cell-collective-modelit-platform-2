import React from 'react';

import Panel from '../../client/app/component/base/panel';
import Checkbox from '../../client/app/component/base/checkbox';
import CheckboxN from '../../client/app/component/base/checkboxN';

import './scss/checkbox-demo.scss';

const DemoStyle = {
	fontSize: 14
}

const RowStyle = {
	margin: 5
};

class CheckboxDemo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { view } = this.props;
		return <Panel {...view} className="checkbox-demo">
			<div style={DemoStyle}>
				<div style={RowStyle}>
					Here's a single checkbox! <Checkbox {...this.singleCheckbox('single')} />
				</div>
				<div>
					<div style={RowStyle}>Here are some checkboxes that act like radio buttons.</div>
					<div style={RowStyle}>Option 1: <Checkbox {...this.multipleCheckbox('multiple', 1)} /></div>
					<div style={RowStyle}>Option 2: <Checkbox {...this.multipleCheckbox('multiple', 2)} /></div>
					<div style={RowStyle}>Option 3: <Checkbox {...this.multipleCheckbox('multiple', 3)} /></div>
				</div>
				<hr />
				<div style={RowStyle}>This is a multi-state checkbox: <CheckboxN numStates={3} {...this.singleCheckbox('single_n', 0)} /></div>
			</div>
		</Panel>;
	}

	singleCheckbox(key, defaultValue=false) {
		return {
			value: this.state[`checkbox_${key}`] || defaultValue,
			onEdit: (value) => this.setState({ [`checkbox_${key}`]: value })
		}
	}

	multipleCheckbox(key, value) {
		return {
			value: this.state[`checkbox_${key}`] === value,
			onEdit: (checked) => this.setState({ [`checkbox_${key}`]: checked ? value : null })
		}
	}
}

export default {
	Component: CheckboxDemo,
	title: "Checkbox and CheckboxN",
	sourceKey: "checkbox"
};