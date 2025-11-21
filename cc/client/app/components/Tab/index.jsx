import React from "react";
import classnames from "classnames";

import Panel from "../Panel";

class Tab extends React.Component {
    render ( ) {
        const { props } = this;
        const { style, children } = props;

        return (
            <Panel style={style}>
                {children}
            </Panel>
        );
    }
}

Tab.List = class extends React.Component {
		static displayName='Tab.List';
    render ( ) {
        const { props }    = this;
        const { children } = props;

				const style = props.style || {};

        return (
            <Panel.Header style={style}>
                <ul>
                    {children}
                </ul>
            </Panel.Header>
        )
    }
}

Tab.Link = class extends React.Component {
		static displayName='Tab.Link';
    constructor (props) {
        super (props)

        this.onClick = this.onClick.bind(this);
    }

    onClick (e) {
        const { props } = this;

        props.onClick(e);
    }

    render ( ) {
        const { props } = this;
        const { children, active } = props;

        return (
            <li className={classnames({ "selected": active })} onClick={this.onClick}>
                {children}
            </li>
        )
    }
}

Tab.Actions = Panel.Actions;
Tab.Action  = Panel.Action;

Tab.Content = class extends React.Component {
		static displayName='Tab.Content';
    render ( ) {
        const { props } = this;
        const { active, children } = props;

				const style = props.style || {};

        return active ?  (
                <Panel.Body style={style}>
                    {children}
                </Panel.Body>
            ) : null
    }
}

export default Tab;