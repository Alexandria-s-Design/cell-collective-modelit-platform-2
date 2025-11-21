import React from 'react';
import Utils from '../../utils';

export default class ButtonPanel extends React.Component {
    render() {
        const { className, title, onEdit, label } = this.props;
				return (<div className="base btn-panel" title={title} onClick={onEdit && onEdit.bind(null)}>
					<input className={Utils.css(className)} />
					{label ? <span>{label}</span> : null}
				</div>);
    }
}

ButtonPanel.defaultProps = { };