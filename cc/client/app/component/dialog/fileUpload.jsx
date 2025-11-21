import React from 'react';
import view from '../base/view';
import FileInput from '../base/fileInput';
import { FormattedMessage } from 'react-intl';

class Content extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { message, extensions } = this.props;

		return (<form>
			<h2>{message ? message : "Select a file to upload."}</h2>
			<label htmlFor="upload">File to upload:</label><FileInput ext={extensions ? extensions.map(ext => {
				if (ext[0] !== '.') return '.' + ext;
				else return ext;
			}) : "*"} />
		</form>);
	}
}

const e = view(Content);
e.width = 250;
e.height = 175;

export default e;