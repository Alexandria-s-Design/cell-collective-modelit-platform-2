import React from 'react';
import Utils from '../../utils';
import {Seq} from 'immutable';
import Animate from '../../mixin/animate';

export default class Scrollable extends React.Component{
    static get minBarHeight(){ return 25; }
    static get minBarWidth (){ return 25; }
    static defaultProps = {
        step: 1,
        fixedHeight: 0,
        fixedWidth: 0,
        scrollSpeed: 1,
        horizontal: false
    }
    constructor(...args) {
        super(...args);
        this.state = Seq(this.state || {}).concat({position: 0}).toObject();
    }
    getDim(capitalized, swap){
        //if swap is false ( default ) returns "height" for vertical (horizontal == false), "width" for horizontal othervise they are exchanged
        const tr = (e => (capitalized ? e : e.toLowerCase()) );
        return tr( (!!swap)^(!this.props.horizontal) ? "Height" : "Width" );
    }
    getHeight(props) {
        return props["parent"+this.getDim(true)] - props["fixed"+this.getDim(true)];
    }
    getFloatHeight(props) {
        return props[this.getDim()] !== undefined ? props[this.getDim()] : (this.refs.float ? this.refs.float["offset"+this.getDim(true)] : 0);
    }
    getScale() {
        return this.getHeight(this.props) / this[this.getDim()];
    }
    getRenderScale(scale) {
        return 1 - Math.max(0, Scrollable["minBar"+this.getDim(true)] / this.getHeight(this.props) - scale);
    }
    getState(props, position) {
        this[this.getDim()] = this.getFloatHeight(props);
        return { position: props.step * Math.ceil(Utils.range(position, 0, Math.max(0, this[this.getDim()] - this.getHeight(props))) / props.step) };
    }
    scroll(position, cbk) {
        document.activeElement && document.activeElement.blur();
        this.refs.animate.animate({
            from: this.state,
            to: this.getState(this.props, position),
            step: s => this.setState(s),
            done: cbk
        });
    }
    setPosition(position) {
        this.position = this.props.step * position;
    }
    UNSAFE_componentWillMount() {
        this[this.getDim()] = this.props[this.getDim()];
    }
    componentWillUnmount() {
        this.draggingelup && this.draggingelup();
    }
    UNSAFE_componentWillReceiveProps(props) {
        this.refs.animate.stop();
        this.setState(this.getState(props, this.position !== undefined ? this.position : this.state.position));
        delete this.position;
    }
    componentDidUpdate() {
        this.props[this.getDim()] === undefined && (this[this.getDim()] || 0) !== this.getFloatHeight(this.props) && this.setState(this.getState(this.props, this.state.position));
    }
    componentDidMount() {
        this.componentDidUpdate();
    }
    onBarMouseDown(e) {
        let sy = this.getScale();
        sy = 1 / (sy * this.getRenderScale(sy));
        const dy = e.clientY - this.state.position / sy;
        Utils.drag(e => this.scroll(sy * (e.clientY - dy)));
        e.preventDefault();
    }
    onWheel(e) {
        this.scroll(this.state.position + 0.05 * this.props.scrollSpeed * Math.sqrt(this.getHeight(this.props)) * Utils.getScroll(e));
    }
    render() {
        const props = this.props;
        const {horizontal} = props;
        const fixed = [];
        const float = [];
        React.Children.forEach(props.children, e => e && e.props && (e.props["data-fixed"] ? fixed.push(e) : float.push(e)));

        const s = this.getScale();
        let bar, overflow, visible = s < 1;
        
        const disabled = 'disabled' in props && this.props.disabled;
        visible = visible && !disabled;

        if (visible) {
            overflow = s + (this.state.position + 1) / this[this.getDim()] < 1;
            const position = this.state.position * this.getRenderScale(s) / this[this.getDim()];

            const pos = Utils.toPercent(position);
            const percPos = Utils.toPercent(s);
            bar = (
                <div className="scrollbar">
                    <div style={horizontal ? {top: percPos, height: pos} : {top: pos, height: percPos}} onMouseDown={this.onBarMouseDown.bind(this)}></div>
                </div>);
        }

        const size = props["parent"+this.getDim(true, true)] - 6;
        const begin = Math.floor(this.state.position / props.step);
        const end = Math.ceil((this.state.position + this.getHeight(props)) / props.step);

        return (
          <Animate ref='animate'>
            <div className={Utils.css((visible || props["fixed"+this.getDim(true, true)]) && "scroll")}>
                {fixed}
                <div className={Utils.css("scrollable", overflow && "overflow", this.props.horizontal && "horizontal")} style={horizontal ? {left: props.fixedWidth} : {top: props.fixedHeight}} onWheel={visible ? this.onWheel.bind(this) : () => { }}>
                    <div style={{[horizontal? "marginLeft" : "marginTop"]: -this.state.position}} ref="float">
                        {float.map((e, i) => (typeof(e.type) == "string" ? e : React.cloneElement(e, {
                            key: e.key || i,
                            ["parent"+this.getDim(true, true)]: size,
                            begin: begin,
                            end: end
                        })), this)}
                    </div>
                    {bar}
                </div>
            </div>
          </Animate>
        );
    }
}
