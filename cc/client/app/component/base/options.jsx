import React from "react";
import Utils from "../../utils";
import Editable from "./editable";
import classNames from 'classnames';

export default class Options extends React.Component {
	constructor(props) {
		super(props);
		this.state = { style: null };
		this.setPopoverRef = this.setPopoverRef.bind(this);
    this.handlePopoverBlur = this.handlePopoverBlur.bind(this);
	}

	handlePointerDown(e, {focus, change}, ev) {
		const isRemoveEl = ev.target.classList.contains('remove');
		if (isRemoveEl) return;
		if (focus) focus(e);
		change(e);
	}

	setPopoverRef(node) {
    this.popoverRef = node;
  }

  handlePopoverBlur(e) {
    if (this.popoverRef && !this.popoverRef.contains(e.target)) {
      this.setState({style: null});
    }
  }

	componentDidMount() {
    document.addEventListener("mousedown", this.handlePopoverBlur);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handlePopoverBlur);
  }

	show(e) {
		let s;
		if (e && !this.state.style) {
			s = {};

			const forcePosition = this.props.forcePosition || {};

			const rect = e.target.parentElement.getBoundingClientRect();
			if(forcePosition.left  !== undefined){
				s.left = forcePosition.left;
			}else{
				rect.left < 0.8*window.innerWidth ? (s.left = rect.left) : (s.right = window.innerWidth - rect.right);
			}
			if(forcePosition.top !== undefined){
				s.top = forcePosition.top;
			}else{
				rect.top < 0.5*window.innerHeight ? (s.top = rect.bottom) : (s.bottom = window.innerHeight - rect.top);
			}
		}
		this.setState({ style: s });
	}
	UNSAFE_componentWillReceiveProps(props) {
		!props.enabled && this.state.style && this.show();
	}
	
	render() {
		const props = this.props;
		let { value: v, options, def: d, get, format, editable, onChange, onAdd, onRemove, onEdit, propertyName, isScrollable } = props;
		const f = typeof(get) == "function" ? get : e => e[get];
		const style = this.state.style;
		const isParent = e => e && Utils.isParent(this.refs.menu, e);
		const change = e => (v != e && onChange(e), this.show());
		const focus = e => (e ? !isParent(e.relatedTarget) && this.show() : setTimeout(() => this.refs.toggle.focus(), 0));
		d && (options = options.filter(e => e.id !== d.id));
		const def = () => (d ? f(d) : (<i>{props.none}</i>));
		const rRemove = e => editable && onRemove && (<div className="remove" onMouseDown={_ => (onRemove(e), _.stopPropagation(), _.preventDefault())}/>);
		const rItem = format ?
			(e => (
				<div onPointerDown={focus.bind(null, e) && change.bind(null, e)}>
					{format(e)}
					{rRemove(e)}
				</div>
			)) :
			(e => (
				<div onPointerDown={this.handlePointerDown.bind(this, e, {change})}>
					{f(e)}
					{rRemove(e)}
				</div>
			));

		const customScroll = {
			overflowY: 'auto',
			height: '58%'
		}

		return (
			<dd className={Utils.css(props.className)}>
				<span className="options">
					{v ? (editable && onEdit ? (<Editable className="bold" value={f(v)} onEdit={e => e && onEdit(v, props.get, e)} maxWidth={props.maxWidth}/>) : f(v)) : def()}   
					<input ref="toggle" type="button" className={classNames("icon", props.dropdowIcon || "base-menu")} onClick={this.show.bind(this)} onBlur={e => { isParent(e) }}/>                 
					{style && (
						<div ref={this.setPopoverRef} className="menu" style={isScrollable ? { ...style, ...customScroll } : style}>
							<ul className="ul">
								<li className={Utils.css(!d && "def")}><div onMouseDown={change.bind(null, null)}>{def()}</div></li>
								{options.map(e => (
									<li key={e.id} >
										{rItem(e)}
									</li>
								)).toArray()}
								{editable && onRemove && <li className="add-option" style={{ fontSize: "10px", fontStyle: "italic" }} onMouseDown={onAdd}><div >+ Add {propertyName}</div></li>}
							</ul>
						</div>
					)}
				</span>
			</dd>
		);
	}
}

Options.defaultProps = {
	get: "name",
	none: "None",
	maxWidth: 150,
	enabled: true,
	isScrollable: false
};