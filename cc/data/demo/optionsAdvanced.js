import React from 'react';
import { Seq } from 'immutable';

import  Panel from '../../client/app/component/base/panel';
import Options from '../../client/app/component/base/options';

const HobbyStyle = {
	'marginTop': 10,
	'fontSize': '14pt',
	'color': 'black'
};

const EmptyStyle = {
	'fontStyle': 'italic',
	'color': 'gray'
};

class OptionsAdvancedDemo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: Seq(),
			person: null,
			editing: false
		};
		this.id = 0;
	}

	nextId() {
		// guarantees a unique ID every time.
		return this.id++;
	}

	setPerson(person) {
		this.setState({
			person
		});
	}

	onAdd() {
		const current = this.state.data;
		const newPerson = {
			'name': 'New Person',
			'hobby': '',
			'id': this.nextId()
		};

		this.setState({
			data: current.concat(newPerson),
			person: newPerson
		});
	}

	onRemove(person) {
		const current = this.state.data;
		const newData = current.filterNot(candidate => candidate.id === person.id);
		this.setState({
			data: newData,
			person: null
		});
	}

	onEdit(person, getter, newValue) {
		if (newValue.trim().length === 0) {
			// do not allow empty/blank names!
			return;
		}
		person.name = newValue;

		// trigger update to reflect new information
		this.setState({
			person
		})
	}

	modifyHobby(person, evt) {
		person.hobby = evt.target.value;

		// we have to actually change the value in the Seq, the object we have is not a reference to the one in our set.
		const data = this.state.data;
		this.setState({
			data: data.map(candidate => candidate.id === person.id ? person : candidate)
		});
	}

	toggleEditing() {
		this.setState({
			editing: !this.state.editing
		})
	}

	render() {
		const { view } = this.props;

		let hobby = null;
		if (this.state.person !== null) {
			const person = this.state.person;
			hobby = <div style={HobbyStyle}>
				{`${person.name}'s Hobby:`}&nbsp;{this.state.editing ?
					<input placeholder="Enter a hobby" value={person.hobby} onChange={this.modifyHobby.bind(this, person)} /> : (person.hobby || <span style={EmptyStyle}>No Hobby</span>)}
			</div>
		}

		return <Panel {...view}>
			<div>
				Select a person:&nbsp;<Options value={this.state.person} options={this.state.data} get="name" editable={this.state.editing}
					onChange={this.setPerson.bind(this)} onAdd={this.onAdd.bind(this)} onRemove={this.onRemove.bind(this)}
					onEdit={this.onEdit.bind(this)} format={(person, focus, change) => {
						return <div onMouseDown={change.bind(null, person)}>{person.name}&apos;s (hobby: {person.hobby || <span style={EmptyStyle}>No Hobby</span>})</div>
					}} none="No person selected"
					propertyName="person" maxWidth={100} />
				<br />
				{hobby}
				<br />
				<button onClick={this.toggleEditing.bind(this)}>{this.state.editing ? "Stop Editing" : "Edit"}</button>
			</div>
		</Panel>;
	}
}

export default {
	Component: OptionsAdvancedDemo,
	title: "Advanced Options",
	sourceKey: "optionsAdvanced"
};