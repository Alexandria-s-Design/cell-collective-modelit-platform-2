import React from "react";

class Panel extends React.Component {
    get style ( ) {
        const style    = { };

        style.position = "relative";
        style.width    = "100%";

        return style;
    }

    render ( ) {
        const { props } = this;
        return (
            // <div className="view" style={{...this.style, ...props.style}}>
            <div className="view" style={{...this.style, ...props.style}} >
                <div>
                    {props.children}
                </div>
            </div>
        )
    }
}

Panel.Header = class extends React.Component {
		static displayName='Panel.Header';
    render ( ) {
        const { props } = this;
        
        return (
            <div className="bar" style={props.style}>
                <span>
                    {props.children}
                </span>
            </div>
        )
    }
}

Panel.Actions = class extends React.Component {
		static displayName='Panel.Actions';
    render ( ) {
        const { props } = this;

        return (
            <div className="actions">
                {props.children}
            </div>
        )
    }
}

Panel.Action  = class extends React.Component {
		static displayName='Panel.Action';
    render ( ) {
        const { props } = this;
        const { name }  = props;

        return (
            <input type="button" className={`icon base-${name}`} title={props.title} onClick={props.onClick}/>
        )
    }
}

Panel.Body   = class extends React.Component {
		static displayName='Panel.Body';
    render ( ) {
        const { props } = this;
				const style = props.style || {};

        return (
            <div style={style}>
                {props.children}
            </div>
        )
    }
}

export default Panel;