import React from "react";
import {Seq} from "immutable";
import Update from "../../action/update";
import Remove from "../../action/remove";
import Utils from "../../utils";
//import Entity from "../../entity/Entity";
import ScrollableNative from "./scrollableNative";
//import TransitionGroup from "react-transition-group";
//import TransitionItem from "./transitionItem";
import Draggable from "./draggable";
import Droppable from "./droppable";
import SortableList from "./sortableList";


export default class MovableList extends React.Component {
	onAdd(c){
		const {entityCreator, entity, dataKey, actions: { onAdd }} = this.props;
		const index = Seq(entity[dataKey]).map(e=>e.index).reduce((v,c)=>Math.max(v,c), 0)+1;
		onAdd(new entityCreator(Seq(c).concat({index}).toObject()));
	}
	onRemove(e){
		const {entityCreator, dataKey, actions: { batch }} = this.props;
		if(!e.parent || !e.parent[dataKey] || !e.parent[dataKey][e.id])
			{return;}

		const index = Seq(e.parent[dataKey]).filter(v=>v===e).first().index;
		batch(Seq([new Remove(e)]).concat(Seq(e.parent[dataKey]).filter(v=>v.index > e.index).map(e=>new Update(e,"index", e.index-1))).toArray());
	}
	render(){
		const {dataKey, creator, creators, editable, draggable, scrollable, dragging, model, parentHeight, header, footer, className, dragLabel, sortable, entity, entityCreator, actions: { onDrag, batch }, props} = this.props;

		let data = Seq({});		
		if (!creators) {
			data = Seq(entity[dataKey]).sortBy((e)=>e.index).cacheResult();
		}		
        
		const ti = { done: () => this.refs.scrollable && this.refs.scrollable.componentDidUpdate() };
		const moveTo = (pos) => {
			if(!(dragging && dragging instanceof entityCreator)) return false;

			const newids = {};
			Seq(dragging.parent[dataKey]).filterNot(e=>e===dragging).sortBy(e=>e.index).skip(dragging.index).forEach(e=>newids[e.id] = e.index-1);
			Seq(data).filterNot(e=>e===dragging).sortBy(e=>e.index).skip(pos).forEach(e=>newids[e.id] = (newids[e.id] !== undefined ? newids[e.id] : e.index)+1);
          
			batch(Seq([new Update(dragging, "index", pos), new Update(dragging, "parent", entity)])
				.concat(Seq(newids).map((v,k)=>model[entityCreator.name][k].index != v && new Update(model[entityCreator.name][k],"index",v)).filter(v=>v)).toArray());
		};
                        
		const droppablePos = (pos) => ((<Droppable onDrop={moveTo.bind(null,pos)} />));

		const renderDataList = (() => {
			if (!creators) {
				return data.toIndexedSeq().map((e,i)=>([(
						React.createElement(creator, Seq(props).concat({entity: e, pos: i, key: i}).toObject())
				)])).flatten(true);
			}
			let dataList = [], dataListCreators = {};
			Seq(creators).forEach((_creator,_dataKey) => {
				Seq(entity[_dataKey]).forEach((e) => {
					dataListCreators[e.id] = _creator;
					dataList.push(e);
				})
			})
			dataList = Seq(dataList).sortBy((e)=> e.position).cacheResult();			
			return dataList.map((e, i) => (
					React.createElement(dataListCreators[e.id], Seq(props).concat({entity: e, pos: i, key: i}).toObject())
			));
		})();

		let ul = null;

		if (sortable === true) {
			const onDropped = (el, newList) => {
				batch(newList.map(v => new Update(model[v.entity][v.id], 'position', v.position)))
			}
			ul = (<SortableList className={Utils.css(editable && "editable", className)} onSort={onDropped}>
					{renderDataList.toArray()}
			</SortableList>);
		} else {
			ul = (<ul className={Utils.css(editable && "editable", className)}>
			<span>
				{ data.toIndexedSeq().map((e,i)=>([
					editable && (
						<li className='dropline' key={e.id+"_drop"}><Droppable onDrop={moveTo.bind(null, i)} /></li>
					),
					( 
						<Draggable key={e.id} onDrag={editable && onDrag.bind(null, () => draggable(e, (dragLabel ? (dragLabel+" ") : "")+"#"+(i+1)), e)}>
							{React.createElement(creator, Seq(props).concat({entity: e}).toObject())}
						</Draggable>
					)
				])).flatten(true).toArray() }
				{editable && (<li className='dropline' key={"new_drop"}>{droppablePos(data.count())}</li>)}
				</span>
		</ul>);
		}
        
		return scrollable ? (
			<ScrollableNative>
				{header}
				{ul}
				{footer}
			</ScrollableNative>
		) : ul;
	}
}
