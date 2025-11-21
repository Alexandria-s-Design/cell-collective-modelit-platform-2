import React from "react";
import ContentEditable from "react-contenteditable";
import classnames from "classnames";

class Editable extends React.Component {
    constructor (props) {
        super (props);

        this.onChange = this.onChange.bind(this);

        this.state    = { ...Editable.defaultState,
            value: props.value
        };
    }

    onChange (e) {
        const { props } = this;
        const state     = { value: e.target.value };
        this.setState(state);

        props.onChange(this.state.value)
    }

    render ( ) {
        const { props, state } = this;
        const { enabled } = props;
        const { value }    = state;

        return (
            <ContentEditable
                html     = {value}
                disabled = {!enabled}
                onChange = {this.onChange} 

            />
        )
    }
}

Editable.defaultProps =
{
    enabled: true
};
Editable.defaultState = 
{
    html: ""
};

export default Editable;