import React from 'react';

import './styles.scss';

export default class CodeGroupInput extends React.Component{

	constructor(props) {
		super(props);
		this.state = {
			_values: Array.from({length: 9}, ()=>'')
		}
	}

	handleChange(key, e) {
		
		const inputValue = `${e.target.value}`.replace(/[\-\.]/g, '');
		let inputState = {...this.state};


		const {name } = e.target;
    const [fieldName, fieldIndex] = name.split("-");
		const fieldIntIndex = parseInt(fieldIndex, 9);


		switch (key) {
			case 0:
				if (inputValue.length) {
					inputState._values[0] = inputValue[0];
				} else {
					inputState._values[0] = '';
				}				
				if (inputValue.length > 1) {
						for (let i=1; (i < inputValue.length && i < 9); i++) {
							inputState._values[i] = inputValue[i];
						}
				}
				break;
			default:				
				inputState._values[key] = inputValue;
		}

		//automatic switching between inputs - when inserting and deleting
		//check if no of char in field >= 0 and field is not the last field i.e in our case it is = 8
		if( inputValue.length >= 0 && fieldIndex < 8){
			// Get the next input field using it's name
			const nextField = document.querySelector(`input[name=${fieldName}-${fieldIntIndex + 1}]`);
			
			if (nextField !== null){
				nextField.focus();
			}
		}

		this.props.onEdit(inputState._values.join(''));
		
		this.setState(inputState);
	}

	render () {		

		return <div className='cgi-wrapper'>
			<div className='cgi-group'>
			<input maxlength="12" name="field-0" onChange={this.handleChange.bind(this, 0)} value={this.state._values[0]}/>
				<input maxlength="1" name="field-1" onChange={this.handleChange.bind(this, 1)} value={this.state._values[1]}/>
				<input maxlength="1" name="field-2" onChange={this.handleChange.bind(this, 2)} value={this.state._values[2]}/>
			</div>
			<div className='cgi-group-divider'></div>
			<div className='cgi-group'>
				<input maxlength="1" name="field-3" onChange={this.handleChange.bind(this, 3)} value={this.state._values[3]}/>
				<input maxlength="1" name="field-4" onChange={this.handleChange.bind(this, 4)} value={this.state._values[4]}/>
				<input maxlength="1" name="field-5" onChange={this.handleChange.bind(this, 5)} value={this.state._values[5]}/>
			</div>
			<div className='cgi-group-divider'></div>
			<div className='cgi-group'>
				<input maxlength="1" name="field-6" onChange={this.handleChange.bind(this, 6)} value={this.state._values[6]}/>
				<input maxlength="1" name="field-7" onChange={this.handleChange.bind(this, 7)} value={this.state._values[7]}/>
				<input maxlength="1" name="field-8" onChange={this.handleChange.bind(this, 8)} value={this.state._values[8]}/>
			</div>
		</div>
	}

}