import React from "react";

export default class ContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = { style: null };
	}
	show(e) {
		if (!this.state.style) {
			const s = {};
			let rect = this.refs.self.getBoundingClientRect();
			(rect.right - rect.left > 150 || rect.bottom - rect.top > 25) && (rect = {}, rect.left = rect.right = e.clientX, rect.top = rect.bottom = e.clientY);
			rect.left < 0.8 * window.innerWidth ? (s.left = rect.left) : (s.right = window.innerWidth - rect.right);
			rect.top < 0.5 * window.innerHeight ? (s.top = rect.bottom) : (s.bottom = window.innerHeight - rect.top);
			this.setState({ style: s });
		}
		this.refs.toggle.focus();
		e.preventDefault();
	}
	render() {
		const { children, options, style, onChange } = this.props;
		const menu = this.state.style;

		return (
			<span className="options">
				{React.cloneElement(React.Children.only(children), { ref: "self", onContextMenu: onChange ? this.show.bind(this) : (e => e.preventDefault()) })}
				<input ref="toggle" className="toggleHidden" type="button" onBlur={() => this.setState({ style: null })}/>
				{menu && (
					<div ref="menu" className="menu" style={menu}>
						<ul className="ul">
							{options.map(e => (
								<li key={e.id}>
									<div className={style && style(e)} onMouseDown={onChange.bind(null, e)}>{e.name}</div>
								</li>
							)).toArray()}
						</ul>
					</div>
				)}
			</span>
		);
	}
}