import React from 'react';

import Editable from '../../client/app/component/base/editable';
import Collapsible from '../../client/app/component/base/collapsible';
import Panel from '../../client/app/component/base/panel';

const TopStyle = {
	'margin': 10,
	'fontSize': 14
};

const DivStyle = {
	'margin': 5
};

const SpanStyle = {
	'color': 'black'
};

class CollapsibleDemo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			show: "Show",
			hide: "Hide"
		}
	}

	setShow(show) {
		if (!show) return;
		this.setState({
			show
		});
	}

	setHide(hide) {
		if (!hide) return;
		this.setState({
			hide
		})
	}

	render() {
		const { view } = this.props;
		const { show, hide } = this.state;

		return <Panel {...view}>
			<div style={TopStyle}>
				<div style={DivStyle}>Show Text:&nbsp;<Editable value={this.state.show} onEdit={this.setShow.bind(this)}><span style={SpanStyle}>{this.state.show}</span></Editable></div>
				<div style={DivStyle}>Hide Text:&nbsp;<Editable value={this.state.hide} onEdit={this.setHide.bind(this)}><span style={SpanStyle}>{this.state.hide}</span></Editable></div>
			</div>
			<Collapsible show={show} hide={hide} showing={true}>
				<h1>This is content that can be collapsed.</h1>
				<hr />
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus risus neque, porttitor vitae bibendum quis, posuere sit amet erat. Cras eget velit rutrum,
					pulvinar libero sed, commodo felis. Maecenas lobortis tristique lorem, a vulputate erat. Vivamus iaculis laoreet velit, a volutpat elit sagittis eu. Quisque sed
					eleifend metus. Donec velit ipsum, ultrices vitae justo vel, cursus iaculis magna. Vivamus vestibulum, neque at ultricies interdum, urna tortor laoreet justo, ac
					elementum lectus quam quis magna. Quisque aliquam consequat blandit. Etiam pharetra ultricies risus eu dictum. Nam sed mattis diam, vel molestie lacus.
				</p>
			</Collapsible>
			<h1>This is content after the collapsible.</h1>
		</Panel>;
	}
}

export default {
	Component: CollapsibleDemo,
	title: "Collapsible",
	sourceKey: "collapsible"
};