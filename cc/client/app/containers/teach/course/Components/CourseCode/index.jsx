import React from 'react';
import PropTypes from 'prop-types';
import { FormattedInput, format } from '@buttercup/react-formatted-input';
import cc from '../../../../../cc';

import './styles.scss';


export const CODEKEY_LENGTH = 9;
export const UNKNOWN_CODE = new Array(CODEKEY_LENGTH).map(e=>"?").join("");

const courseKeyPattern = [{ char: /[a-zA-Z0-9]/, repeat: 3 }, { exactly: '-' }, { char: /[a-zA-Z0-9]/, repeat: 3 }, { exactly: '-' }, { char: /[a-zA-Z0-9]/, repeat: 3 }];
export const formatCourseCode = (value) => {
	return format((value ? value : ""), courseKeyPattern).formatted;
}

class CourseCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = { _value: '' };
  }

	componentDidUpdate(prevProps) {
		const new_val = this.props.value;
		if (typeof(new_val) === 'string') {
			if (new_val !== this.state._value) {
				this.setState({
					_value: new_val
				});
			}
		}
	}

  render() {
    const { value, onEdit, inputProps } = this.props;
		
		/*
		const copyEl = (
			<span className="corseCodeCopyToClipboard" onClick={() => {cc._.copyToClipboard(value)}} title="Copy course code to clipboard">(C)</span>
		)
		*/

    if (!onEdit) {
      const formatted = formatCourseCode(value);
      return <><span className="courseCodeLabel">Course Key:</span><span className="courseCodeText">
				{formatted} 
				{/* {copyEl} */}
				</span></>;
    }
    return (
			<>
				<FormattedInput
					format={courseKeyPattern}
					value={value ? value : this.state._value}
					onChange={(formattedValue, raw) => {
						onEdit(formattedValue, raw);
						this.setState({ _value: formattedValue });
					}}
					{...inputProps}
				/>
				{/* {copyEl} */}
			</>
    );
  }
}

CourseCode.propTypes = {
  value: PropTypes.string.isRequired,
  onEdit: PropTypes.func
};

export default CourseCode;
