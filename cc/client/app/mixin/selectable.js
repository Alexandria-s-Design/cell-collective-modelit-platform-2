import React from 'react';

export default class Selectable extends React.Component{
    static defaultProps = {
      master: true
    }
    autoSelect() {
        const p = this.props;
        p.master && p.onSelect && !p.selected && p.data.size && p.onSelect(p.data.first());
    }
    UNSAFE_componentWillMount() {
        (super.UNSAFE_componentWillMount || (()=>{})).apply(this,arguments);
        this.autoSelect();
    }
    componentDidUpdate() {
        (super.componentDidUpdate|| (()=>{})).apply(this,arguments);
        this.autoSelect();
    }
    render() {
        return React.Children.only(this.props.children);
    }
}