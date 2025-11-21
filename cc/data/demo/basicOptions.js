import React from 'react';

import  Panel from '../../client/app/component/base/panel';
import BasicOptions from '../../client/app/component/base/basicOptions';

const OptionsData = [
	"The first option",
	"A better option",
	"The very best option",
	"Actually, no I'm cooler!",
	"I'm not that cool, tbh :(",
	"Haha, look at these losers. I'm obviously the best option."
];

const EmptyStyle = {
	'fontStyle': 'italic',
	'color': 'lightgray'
};

class BasicOptionsDemo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: null
		};
	}

	setSelected(selected) {
		this.setState({
			selected
		});
	}

	render() {
		return <Panel>
			<div>
				Select One: <BasicOptions options={OptionsData} onChange={this.setSelected.bind(this)} none="Please select an option." />
				<br />
				<br />
				You selected: {this.state.selected ? this.state.selected : <span style={EmptyStyle}>None</span>}
			</div>
		</Panel>;
	}
}

export default {
	Component: BasicOptionsDemo,
	title: "BasicOptions (Convenience wrapper for Options)",
	sourceKey: "basicOptions"
};