import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import Editable from "../base/editable";
import TransitionItem from "../base/transitionItem";
import Entity from "../../entity/Entity";
import { TransitionGroup, Transition } from "react-transition-group";

class MetadataMultiple extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	removeContent(view) {
		if( 'doAdd' in view.getState() ){
			view.setState({ doAdd: false });
		}
		this.setState({ content: null });
	}
	select(id){
		this.setState({ selected: id }, this.props.onChange ? () => this.props.onChange(this.state.selected) : () => {});
	}
	getSelected() {
		if( !this.props.selectable ) return undefined;
		else {
			if( this.state.selected === undefined ) return null;
			else return this.state.selected;
		}
	}
	render() {
		const props = this.props;
		const actions = props.actions;
		const name = "m" + props.name;
		const values = Seq(props.entity[name]);
		const d = Entity[name];
		const width = props.parentWidth - 24;
		const ti = { done: () => props.parent.refs.scrollable.componentDidUpdate() };
		let adding = this.state.content;
		if( 'doAdd' in props ){
			// allow external buttons to control adding/removing,
			// but only trigger this functionality if the 'doAdd'
			// attribute is present in props (i.e. a person is
			// intentionally attempting to exert such control)
			adding = adding || props.doAdd;
		}

		let selected = null;
		if( this.props.selectable ) {
			selected = this.state.selected || null;
		}

		return (
			<div>
				{props.label && (<h1>
					{props.label}
					{actions && (<input type="button" className="icon base-add" title="Add" disabled={Utils.enabled(!adding)} onClick={() => this.setState({ content: true })}/>)}
				</h1>)}
				<ol>
					<TransitionGroup>
						{values.sortBy(e => e.position).map((v, k) => {
							const edContent = <Editable value={v.value} onEdit={actions && (e => (e ? actions.onEdit(v, "value", e) : actions.onRemove(v)))} maxWidth={width}/>;
							return (<Transition><TransitionItem key={k} {...ti}>
								<li className={this.props.selectable ? "lo-select" : null}>
									<div>
										{ this.props.selectable ? (v.id === selected ? <span className="lo-highlight">{edContent}</span> : <span onClick={this.select.bind(this, v.id)}>{v.value}</span>) : edContent }
										{actions && (<div className="remove" onClick={actions.onRemove.bind(null, v)}/>)}
									</div>
								</li>
							</TransitionItem></Transition>)
						}).toArray()}
					</TransitionGroup>
					{adding && (
						<li>
							<div>
								<Editable placeHolder={props.placeHolder} onEdit={e => (e && actions.onAdd(new d({ value: e, position: (values.map(e => e.position).max() + 1) || 0 })), this.removeContent(props.view))} maxWidth={width}/>
								<div className="remove" onClick={this.removeContent.bind(this, props.view)}/>
							</div>
						</li>
					)}
				</ol>
			</div>
		);
	}
}

MetadataMultiple.defaultProps = {
	selectable: false
};

export default MetadataMultiple;