import React from 'react';
import { Seq } from 'immutable';

import  Panel from '../../client/app/component/base/panel';
import Options from '../../client/app/component/base/options';

const OptionsData = Seq([
	{ 'name': 'Matthew', 'hobby': 'taking people\'s money.', 'id': 0 },
	{ 'name': 'Mark', 'hobby': 'talking to people and paraphrasing.', 'id': 1 },
	{ 'name': 'Luke', 'hobby': 'being a doctor!', 'id': 2 },
	{ 'name': 'John', 'hobby': 'hanging around an island of the coast of Greece.', 'id': 3 }
]);

const HobbyStyle = {
	'marginTop': 10,
	'fontSize': '14pt',
	'color': 'black'
};

class OptionsSimpleDemo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			person: null
		};
	}

	setPerson(person) {
		this.setState({
			person
		});
	}

	render() {
		const { view } = this.props;

		const defaultPerson = OptionsData.get(0);

		const person = this.state.person || defaultPerson;
		let hobby = <div style={HobbyStyle}>{`${person.name}'s hobby is ${person.hobby}`}</div>;

		return <Panel {...view}>
			<div>
				Select a person:&nbsp;<Options value={this.state.person} options={OptionsData}
					def={defaultPerson} get="name" onChange={this.setPerson.bind(this)} />
				<br />
				{hobby}
			</div>
		</Panel>;
	}
}

export default {
	Component: OptionsSimpleDemo,
	title: "Simple Options",
	sourceKey: "optionsSimple"
};