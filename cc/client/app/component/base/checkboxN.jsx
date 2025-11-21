import React from 'react';
import Utils from '../../utils';

export default class CheckboxN extends React.Component {
    render() {
        const { value: e, className, numStates, title, onEdit } = this.props;
        return (<span className={Utils.css(className, "checkbox", e && ("checked" + e), Utils.enabled(onEdit))} title={title} onClick={onEdit && onEdit.bind(null, (e + 1) % numStates)}/>);
    }
}

CheckboxN.defaultProps = { numStates: 3 };
