import React from 'react';
import { Seq } from 'immutable';

import classNames from 'classnames';

class DropdownText extends React.Component {
	constructor(props) {
		super(props);
		this.state = { focused: false, changeTo: null };
	}

	componentDidUpdate() {
		if( this.state.changeTo !== null ) this.setState({ changeTo: null });
	}

	render() {
		const inProps = Seq(this.props).flip().filter(item => !DropdownText.INPUT_EXCLUDE.includes(item)).flip().toJS();
		const options = this.props.choices || [];

		const _onFocus = this.props.onFocus;
		const onFocus = evt => {
			_onFocus && _onFocus(evt);
			this.setState({ focused: true });
		};

		const _onBlur = this.props.onBlur;
		const onBlur = evt => {
			_onBlur && _onBlur(evt);
			this.setState({ focused: false });
		};

		const val = this.state.changeTo;
		if( val !== null ) {
			inProps.value = val;
		}

		return (<div className={classNames(this.props.className, "dropdown-text input")}>
			<input {...inProps} type="text" autoComplete="off" defaultValue={this.props.defaultValue} onFocus={onFocus} onBlur={onBlur} />
			{(this.state.focused && options.length > 0) ? (<ul className="dropdown-box">{options.map((choice, idx) => {
				return <li key={idx} onMouseDown={() => { this.setState({ changeTo: choice, focused: false }) } } title={choice}>{choice}</li>;
			})}</ul>) : null}
		</div>);
	}
}

DropdownText.INPUT_EXCLUDE = ["type", "autocomplete", "onFocus", "onBlur", "value"];

export default DropdownText;
