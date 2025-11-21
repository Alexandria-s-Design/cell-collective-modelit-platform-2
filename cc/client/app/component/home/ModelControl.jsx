import React  from "react";
import { Seq } from "immutable";

import Utils from "../../utils"
import Options from "../base/options";

import { ModelType } from "../../cc";

import BaseMenu from "../../components/AppBar/BaseMenu";

export default class ModelControl extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	show(evt) {
		evt.persist();
		this.setState({
			showMenu: true
		}, () => {
			this.listener = this.hide.bind(this);
			evt.stopPropagation();
			window.addEventListener('click', this.listener);
		});
	}

	hide() {
		this.setState({
			showMenu: false
		});
		window.removeEventListener('click', this.listener);
	}

	render ( ) {
		const { props } = this;
		const { value } = props;

		const data 	= Seq(ModelType)
			.filter(v => !v.beta)
			.map(v => ({ id: Utils.newGuid(), name: v.name, shortLabel: v.shortLabel }));

		const onChange = val => {
			props.onChange(val);
			this.hide();
		};

		const noFilter = <span style={ { color: 'gray', fontStyle: 'italic' } }>No Filter</span>;

		return (
			<div style={props.style || {}} className="model-control">
				<div className="icon base-filter" onClick={this.show.bind(this)}></div>
				<div className="filter-label" onClick={this.show.bind(this)}>{ value != null ? value.name : noFilter }</div>
				<div className="menu to-front" style={ { visibility: this.state.showMenu ? "visible" : "hidden", display: "block" } }>
					<ul className="ul">
						<BaseMenu title="Model Type"
								  content={							<ul className="ul">
									  <li>
										  <div onClick={onChange.bind(this, null)} style={ {fontStyle: 'italic', color: 'gray'} }>
											  No Filter
										  </div>
									  </li>
									  {data.map(n => (<li key={n.name}>
										  <div onClick={onChange.bind(this, n)}>
											  {n.shortLabel || n.name}
										  </div>
									  </li>)).toArray()}
								  </ul>
								  } />
					</ul>
				</div>
			</div>
		);
	}
}
