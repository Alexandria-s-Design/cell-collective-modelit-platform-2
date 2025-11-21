import React from 'react';
import ReactDom from 'react-dom';
import Immutable, {Seq} from 'immutable';
import Utils from '../utils';

const defState = { editing: false, suggestion: null, value: undefined };

export default (parent) => ( class extends parent {
    static defaultProps = {
      ...parent.defaultProps,
      maxValues: 20,
    }
    constructor(props){
      super(props);
      this.state = Seq(this.state || {}).concat({editing: false}).toObject();
    }
    set(value) {
        this.submit(value);
        this.setState(defState);
    }
    suggestions(value) {
        return (value = value.toLowerCase()) && new Immutable.Map(this.props.values.filter(e => e && e.toLowerCase().indexOf(value) >= 0).map(e => { const k = e.toLowerCase(); return [k, { k: k, v: e, i: k.indexOf(value)}]})).
            valueSeq().sort((a, b) => (a.i !== b.i ? a.i - b.i : (a.k < b.k ? -1 : 1))).take(this.props.maxValues);
    }
    onEdit(e) {
        const rect = ReactDom.findDOMNode(this).getBoundingClientRect();
        this.setState({
            editing: true,
            left: rect.left,
            top: rect.bottom
        });
        this.props.preventDefault && e.preventDefault();
    }
    onBlur(_) {
        this.submit(this.state.value, _);
        this.setState(defState);
    }
    onChange() {
        this.setState({
            value: this.refs.input.value,
            suggestion: null
        });
    }
    onSubmit(e) {
        e.preventDefault();
        this.submit(this.state.value);
        this.setState(defState);
    }
    onKeyDown(max, e) {
        const i = this.state.suggestion == null ? -1 : this.state.suggestion;
        switch (e.keyCode) {
            case 38: i > 0 && this.setState({ suggestion: i - 1 }); e.preventDefault(); break;
            case 40: i < max - 1 && this.setState({ suggestion: i + 1 }); e.preventDefault(); break;
            case 13: i >= 0 && (this.set(this.suggestions(this.state.value !== undefined ? this.state.value : this.props.value).get(i).v), e.preventDefault()); break;
        }
    }
    componentDidUpdate(_, state) {
        parent.prototype.componentDidUpdate && parent.prototype.componentDidUpdate.apply(this, arguments);
        !state.editing && this.state.editing && this.refs.input.focus();
    }
    renderForm(value, style, className, props={}) {
        let suggestions, ns;
        if (value && this.props.values) {
            const l = value.length;
            const is = this.state.suggestion;
            const s = this.suggestions(value);
            suggestions = s.size === 1 && s.first().v === value ? [] : s.map((e, i) => (
                    <li key={e.k} className={Utils.css(is === i && "selected")}>
                        <div onMouseDown={this.set.bind(this, e.v)}>
                            {e.v.substring(0, e.i)}
                            <b>{e.v.substring(e.i, e.i + l)}</b>
                            {e.v.substring(e.i + l)}
                        </div>
                    </li>
                )).toArray();
            ns = suggestions.length;
        }
        return (
            <form className={Utils.css("editable","menu",className)} onSubmit={this.onSubmit.bind(this)} {...props}>
                <input ref="input" value={value} style={style} maxLength={this.props.maxLength} spellCheck="false" onChange={this.onChange.bind(this)} onBlur={this.onBlur.bind(this)} onKeyDown={ns && this.onKeyDown.bind(this, ns)}/>
                {ns > 0 && (<ul className="ul" style={{ left: this.state.left, top: this.state.top }}>{suggestions}</ul>)}
            </form>
        );
    }
} );
