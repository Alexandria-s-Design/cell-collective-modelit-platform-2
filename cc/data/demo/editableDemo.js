import React from 'react';

import Panel from '../../client/app/component/base/panel';
import Editable from '../../client/app/component/base/editable';

const DefaultValue = "Default Value";
const FancyStyle = {
	'backgroundColor': 'skyblue',
	'color': 'white',
	'padding': 4,
	'borderRadius': 8
}
const DivStyle = {
	'margin': '5px',
	'fontSize': '14px'
};

const EmptyStyle = {
	'color': 'gray'
};

class EditableDemo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value_a: DefaultValue
		}
	}

	set(key, value) {
		const fullkey = `value_${key}`;
		this.setState({
			[fullkey]: value
		});
	}

	get(key) {
		return this.state[`value_${key}`];
	}

	render() {
		const { view } = this.props;
		return <Panel {...view}>
			<div style={DivStyle}>
				Enter a value: <Editable placeHolder="Enter something!" value={this.get('a')} def={DefaultValue} onEdit={this.set.bind(this, 'a')} />
			</div>
			<div style={DivStyle}>
				Enter a value: <Editable placeHolder="Double click to edit!" value={this.get('b')} onEdit={this.set.bind(this, 'b')} editOnDoubleClick={true} />
			</div>
			<div style={DivStyle}>
				Enter a value: <Editable placeHolder="This one wraps text!" multiline={true} maxWidth={150} value={this.get('c')} onEdit={this.set.bind(this, 'c')} />
			</div>
			<div style={DivStyle}>
				Enter a value: <Editable placeHolder="This value is measured in pixels!" value={this.get('d') || 0} onEdit={this.set.bind(this, 'd')} following="px" />
			</div>
			<div style={DivStyle}>
				Enter a value: <Editable placeHolder="This one displays the value with a fancy style!" value={this.get('e')} onEdit={this.set.bind(this, 'e')}>
					{this.get('e') ? <span style={FancyStyle}>{this.get('e')}</span> : <span style={EmptyStyle}>Please enter a value.</span>}
				</Editable>
			</div>
		</Panel>;
	}
}

export default {
	Component: EditableDemo,
	title: "Editable",
	sourceKey: "editableDemo"
}