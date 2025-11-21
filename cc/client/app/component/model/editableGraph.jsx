import React, {createRef} from "react";
import Immutable, { Seq } from "immutable";
import NetViz from "ccnetviz";
import Utils from "../../utils";
import Application from "../../application";
import view from "../base/view";
import StyledEl from "../base/styledEl";
import Graph from "../graph";
import LayoutControl from "./layoutControl";
import Update from "../../action/update";

const offset = 8;
const viewport = { left: offset, right: offset, top: offset, bottom: offset };

export default (readonly, styles, selection, onSelect, onUpdate, nodeColor, edgeStyle = Graph.edgeStyle, interact = {}, state = {})  => {
    interact.canEdgeClick = interact.canEdgeClick || (() => false) ;
    interact.canEdgeSelect = interact.canEdgeSelect || (() => false) ;
    interact.canNodeDrag = interact.canNodeDrag || (() => true) ;
    interact.onEdgeSelect = interact.onEdgeSelect || (() => false);
    interact.canClip     = interact.canClip || (()=> false) ;
    interact.onClip      = interact.onClip  || (() => {}) ;
    interact.onLabelEdit = interact.onLabelEdit || (() => {}) ;
    class self extends React.Component {
        constructor(props) {
            super(props);
            this.state = { viewport: viewport, editedNode: null, editing: false, movableNode: null};
						this.masterRef = createRef();
						this.selectionRef = createRef();
						this.draggingRef = createRef();
						this.movingRef = createRef();
        }
        shouldComponentUpdate(props, state) {
					return this.props.entities !== props.entities ||
						this.state !== state ||
						this.state.editing !== state.editing ||
						!view.equal(this.props.view, props.view) ||
						this.props.imageVisible !== props.imageVisible;
        }
        componentDidUpdate(_, prevState){
            this.setViewport(this.masterRef.current.self.getViewport());
            this.state.editing !== prevState.editing && selection && selection(this, this.props);
        }
        UNSAFE_componentWillMount(){
           interact.onKeyUp && window.addEventListener("keydown", this.cbkKeyUp = ((e)=>interact.onKeyUp(e, this)));
        }
        componentWillUnmount(){
            this.cbkKeyUp && window.removeEventListener("keydown", this.cbkKeyUp);
        }
        showEditing(){
            let comp;
            if(this.state.editing && this.props.selected && (comp = this.props.selected.Component)){
                const {editedText} = this.refs;

				let c = this.getNodeLayoutCoords(this.props,comp);
				let norm; NetViz.layout.normalize(norm = [{x: c.x, y: c.y}], this.dimension); norm = norm[0];
				c = this.masterRef.current.transformInv(norm);
				const tp = this.masterRef.current.self.getTextPosition({x: norm.x, y: norm.y, label: comp.name});
				const l_pos = tp.chars.length > 0 && !isNaN(tp.chars[0].bottom) ? tp.chars : [{dx:0,dy:0,width:0,height:0}];

				const ltp = Seq(l_pos).last();
				const textw = Math.max( ltp ? Math.abs(l_pos[0].dx * tp.fontScale - ( ( ltp.dx + ltp.width ) * tp.fontScale)) : 0, 50);

				const st = {top: c.y - ( l_pos[0].dy + l_pos[0].height ) * tp.fontScale + tp.offsetY, width: textw};
				if(norm.x <= 0.5){
					st.left = c.x + l_pos[0].dx * tp.fontScale;
				}else{
					st.left = c.x - textw;
					st.textAlign = "right";
				}

				if(editedText){
					editedText.setStyle(st);
					this.state.focusAll && editedText.refs.self.select();
				}
			}
		}
		setViewport(e) {
			const sc = 1 / e.size;
			const p = e => Utils.toPercent(sc * e);

			this.showEditing();

			let is = 0;
			const v = sc === 1 ? viewport : { width: p(1), height: p(1), left: p(-e.x), bottom: p(-e.y) };
			const m = Immutable.fromJS(v).forEach((v, k)=>(is |= (v != this.state.viewport[k])));
			if(is) this.setState({viewport: v});
		}
		onLoad(){
			this.showEditing();
			return true;
		}
		onChangeViewport(e) {
			const f = g => {
				g.setViewport(e);
				g.draw();
			};
			selection && f(this.selectionRef.current.self);
			this.dragging && f(this.draggingRef.current.self);
			this.moving && f(this.movingRef.current.self);

			this.setViewport(e);
		}
		onDragStart(e, f) {
			const props = this.props;
			if (props.editable) {
				const model = props.model;
				let entity = model.Component[e];

				if(entity === this.state.movableNode){
					this.moving = { entity: entity };
					this.update( props );
					this.movingRef.current.self.setViewport(this.masterRef.current.self.getViewport());
					!props.selected.Layout && props.actions.batch(LayoutControl.creator(Application.defName(model.Layout, "New Layout "), model.Component, props.editable));
				} else {
					this.dragging = { entity: entity };
					this.draggingRef.current.self.setViewport(this.masterRef.current.self.getViewport());
				}
			}
			return true;
		}
		transformCoords(e, d){
			d = d || this.dimension;
			e = this.masterRef.current.transform(e);
			return {x: ( (d.maxX - d.minX) * e.x + d.minX ) || 0, y: ( (d.maxY - d.minY) * e.y + d.minY ) || 0};
		}
		onDrag(e, f) {
			if(this.moving){
				const te = this.transformCoords(e);
				this.moving.x = te.x;
				this.moving.y = te.y;
				this.updateMoving(this.moving);
				selection && selection(this, this.props);
			}else if(this.dragging){
				const te = this.transformCoords(e);
				this.dragging.x = te.x;
				this.dragging.y = te.y;
				this.updateDragging(this.dragging, f);
			}
		}
		onDragStop(_, f) {
			if(this.moving){
				const d = this.moving;
				this.updateMoving(this.moving = null);
				const e = this.props.selected.Layout.components[d.entity.id];
				const updates = [new Update(e, "x", d.x), new Update(e, "y", d.y)];
				if (this.props.model.Component[d.entity.id]) {
					const nodeComp = this.props.model.Component[d.entity.id];
					updates.push(new Update(nodeComp, "x", d.x));
					updates.push(new Update(nodeComp, "y", d.y));
				}
				this.props.actions.batch(updates);
			}else if(this.dragging){
				interact.canClip(this.dragging, f) && interact.onClip(this.dragging, f, this.props);
				this.updateDragging(this.dragging = null, f);
			}
		}
		getNodeLayoutCoords(props, e){
			const l = props.selected && props.selected.Layout;
						return l ? (l.components[e.id] || e) : e;
		}
		transformNodes(props, e, style, color) {
			style = style || {};
			const c = color && color(props);
			return e.map((v, e) => (e = this.getNodeLayoutCoords(props, v), { uniqid: v.id, label: v.name, color: c && c(v), entity: v, style: style[v.isExternal], x: e.x, y: e.y })).toObject();
		}
		transformEdges(props, e, nodes, style) {
			return e.map((e, id) => ({ source: nodes[e.source], uniqid: id, entity: e, target: nodes[e.target.id], style: style && style(e, props) })).toArray();
		}
		
		update(props) {
			let nodes, rawnodes, edges;
			if (props.model.id !== undefined) {
				nodes = this.transformNodes(props, this.nodes = props.model.nodes, styles.node, nodeColor);
				edges = this.transformEdges(props, props.model.edges, nodes, edgeStyle);
				nodes = Seq(nodes).toArray();

        const calcDim = (n, l) => {
					let nodesCount = Seq(n).map(n=>Seq(n).toObject()).toArray()
					const d = n.length ? NetViz.layout.normalize(nodesCount, l) : {minX: 0, minY: 0, maxX: 1, maxY: 1};
					let ch = false;
					if(d.minX === d.maxX){d.minX = Math.floor(d.minX); d.maxX = Math.ceil(d.maxX + Number.EPSILON); ch = true;}
					if(d.minY === d.maxY){d.minY = Math.floor(d.minY); d.maxY = Math.ceil(d.maxY + Number.EPSILON); ch = true;}
					n = this.transformNodes(props, this.nodes = props.model.nodes, styles.node, nodeColor);
					edges = this.transformEdges(props, props.model.edges, n, edgeStyle);
					n = Seq(n).toArray();
					NetViz.layout.normalize(n, d);
					return {d, n, e:edges};
				};

				let d;
				d = calcDim(Seq(nodes).map(n=>Seq(n).toObject()).toArray());
				this.defaultDimension = d.d;
				d = calcDim(nodes, props.selected && props.selected.Layout); this.dimension = d.d; nodes = d.n; edges = d.e;

				this.nodesNum = nodes.length;
				this.edgesNum = edges.length;

				if (this.moving) {
					const id = this.moving.entity.id;
					const map = {};
					map[id] = true;
					edges = edges.filter(e => {
						const s = e.source.uniqid;
						const t = e.target.uniqid;
						return (s === id || t === id) ? !(map[s] = map[t] = true) : true;
					});
					this.nodes = this.nodes.filterNot((_, k) => map[k]).cacheResult();
					nodes = nodes.filter(e => !map[e.uniqid]);
				}
			}
			const graph = this.masterRef.current.self;
			(props.model !== this.props.model || (props.selected && props.selected.Layout !== this.props.selected.Layout && !this.moving)) && graph.resetView();
			

			selection && selection(this, props);

			graph.set(nodes, edges).draw();
		}
		updateDragging(props, f){
			let nodes, edges;
			if (props) {
				nodes = {}, edges = {};

				let nstyle, c, ne, e = props.entity;
				(c = this.getNodeLayoutCoords(props, e)) && (nodes[e.id] = {x: c.x, y: c.y, id: e.id});
				nodes[e.id+"?"] = {x: props.x, y: props.y, id: e.id+"?"};

				if(c = interact.canClip(props, f)){ c.nStyle && (nstyle = {undefined: c.nStyle}); }

				const tid = e.id+"?";
				const sid = (c && c.circle) ? tid : e.id;
				(edges[sid] = {})[tid] = {source: sid, target: nodes[tid], type: true};

				nodes = this.transformNodes(this.props, Seq(nodes), nstyle, nodeColor);
				edges = this.transformEdges(this.props, Seq(edges).map(e => Seq(e).valueSeq()).valueSeq().flatten(true), nodes, edgeStyle);

				NetViz.layout.normalize(nodes = Seq(nodes).toArray(), this.dimension);
				nodes = nodes.slice(1);
				c && c.clipTo && (nodes[0].x = c.clipTo.x, nodes[0].y = c.clipTo.y);
			}
			this.draggingRef.current.self.set(nodes, edges).draw();
		}
		updateMoving(props) {
			let nodes, edges;
			if (props) {
				const e = props.entity;
				e.neighbors(nodes = {}, edges = {});
				nodes = this.transformNodes(this.props, Seq(nodes), styles.node, nodeColor);
				nodes[e.id].x = props.x;
				nodes[e.id].y = props.y;
				edges = this.transformEdges(this.props, Seq(edges).map(e => Seq(e).valueSeq()).valueSeq().flatten(true), nodes, edgeStyle);
				NetViz.layout.normalize(nodes = Seq(nodes).toArray(), this.dimension);
			}
			this.movingRef.current.self.set(nodes, edges).draw();
		}
		adjustMoving(nodes) {
			const d = this.moving;
			let e = d;
			if (e && (e = nodes[e.entity.id])) {
				e.x = d.x;
				e.y = d.y;
			}
		}
		get image() {
			const e = this.masterRef.current.self;
			e.draw();
			return e.image();
		}
		componentDidMount() {
			this.props.model.id !== undefined && this.update(this.props);
		}
		UNSAFE_componentWillReceiveProps(props) {
			props.entities !== this.props.entities || (props.selected && props.selected.Layout !== this.props.selected.Layout) ? this.update(props) : onUpdate && onUpdate(this, props);
		}
		render() {
			const { model, editable, parentWidth, parentHeight, view } = this.props;
			const p = { size: this, parentWidth: parentWidth, parentHeight: parentHeight, view };
			const background = Seq(model.mBackgroundImage).first();
			const myOnClick = (e, el) => {

				const nid = (el || {}).node ? el.node.uniqid: null;
				const lid = (el || {}).label ? el.label.uniqid: null;
				const eid = (el || {}).edge ? el.edge.uniqid: null;
				if(model.Component){
					if (this.state.movableNode) this.setState({movableNode: null});
					if(el && el.edge  && interact.canEdgeClick  && interact.canEdgeClick(e, el, this.props)  && interact.onEdgeClick  && interact.onEdgeClick(e, this.props, el.edge)) return;
					if(el && el.node  && interact.canNodeClick  && interact.canNodeClick(e, el, this.props)  && interact.onNodeClick  && interact.onNodeClick(e, this.props, model.Component[nid], this)) return;
					if(onSelect && (el === null || el.node ) && onSelect(this, model.Component[nid])) return;
					if(el && el.label && interact.canLabelClick && interact.canLabelClick(e, el, this.props) && interact.onLabelClick && interact.onLabelClick(e, this.props, model.Component[lid], this)) return;
					if(el && el.edge  && interact.onEdgeSelect  && interact.canEdgeSelect(e, el, this.props) && interact.onEdgeSelect(e, this.props, model.edges.get(eid))) return;
				}
				if(model.Compartment && !Seq(model.Compartment).isEmpty()){
					if (this.state.movableNode) this.setState({movableNode: null});
					if(el && el.edge  && interact.canEdgeClick  && interact.canEdgeClick(e, el, this.props)  && interact.onEdgeClick  && interact.onEdgeClick(e, this.props, el.edge)) return;
					if(el && el.node  && interact.canNodeClick  && interact.canNodeClick(e, el, this.props)  && interact.onNodeClick  && interact.onNodeClick(e, this.props, model.Compartment[nid], this)) return;
					if(onSelect && (el === null || el.node ) && onSelect(this, model.Compartment[nid])) return;
					if(el && el.label && interact.canLabelClick && interact.canLabelClick(e, el, this.props) && interact.onLabelClick && interact.onLabelClick(e, this.props, model.Compartment[lid], this)) return;
					if(el && el.edge  && interact.onEdgeSelect  && interact.canEdgeSelect(e, el, this.props) && interact.onEdgeSelect(e, this.props, model.edges.get(eid))) return;
				}
			};

			const myOnDblClick = (e, el) => {
				const nid = (el.nodes[0] || {}).node ? el.nodes[0].node.uniqid: null;
				nid && interact.canNodeDblClick && interact.canNodeDblClick(e, el, this.props) && interact.onNodeDblClick &&  interact.onNodeDblClick(e, this.props, model.Component[nid], this);
				( !(el.labels || []).length && !el.edges.length && !el.nodes.length && interact.onDblClick ) &&  interact.onDblClick(e, this);
			};

			const eClk = (e, el) => ( ( interact.canEdgeClick && interact.canEdgeClick(e, el, this.props )  || ( interact.canEdgeSelect && interact.canEdgeSelect(e, el, this.props) ) ) );

			const saveEdited = () => {interact.onLabelEdit(this, this.refs.editedText?.state?.props?.value)};
			const Inp = StyledEl("input", ({refs:{self}})=>self.focus());
			const inpKeyUp = (self, e)=> e.keyCode == 13 && saveEdited();
			const disable = this.props.disableDeleteKey;
			const imageVisible = this.props.imageVisible;

			return (
				<div className="canvas" onMouseOver={disable && disable.bind(null, true)} onMouseLeave={disable && disable.bind(null, false)}>
					<div style={this.state.viewport}>
						{background && imageVisible && (<img src={Application.url(background.value)}/>)}
					</div>
					<Graph ref={this.masterRef} {...p} onLoad={this.onLoad.bind(this)} onChangeViewport={this.onChangeViewport.bind(this)} nodesClickable={(e, el) => (!!selection || !readonly)}
						edgesClickable={eClk} onClick={myOnClick} onDblClick={myOnDblClick} onContextMenu={interact.onContextMenu && ( (e, el) => interact.onContextMenu(e,this,el) )} canLabelClick={interact.canLabelClick &&  ( (e, el) => interact.canLabelClick(e, el, this.props) ) }
						onDrag={!readonly && { start: this.onDragStart.bind(this), drag: this.onDrag.bind(this), stop: this.onDragStop.bind(this) }}/>
					{!readonly && editable && (<Graph ref={this.movingRef} {...p}/>)}
					{selection && (<Graph ref={this.selectionRef} {...p} styles={styles.selection}/>)}
					{!readonly && editable && (<Graph ref={this.draggingRef} {...p} styles={styles.dragging}/>)}
					{this.state.editing && this.props.selected && this.props.selected.Component && (<Inp type="text" ref="editedText" style={{left:"0px", top:"0px"}} onKeyUp={inpKeyUp} onBlur={saveEdited} onChange={(self)=>{self?.setState({props:{value: self?.refs?.self?.value}})}} value={this.props.selected.Component.name} />)}
					{this.state.editing && this.props.selected && this.props.selected.Compartment && (<Inp type="text" ref="editedText" style={{left:"0px", top:"0px"}} onKeyUp={inpKeyUp} onBlur={saveEdited} onChange={(self)=>{self?.setState({props:{value:self?.refs?.self?.value}});}} value={this.props.selected.Compartment.name} />)}
		
				</div>
			);
		}
	}
	return self;
};
