import { Seq } from "immutable";
import NetViz from "ccnetviz";
import Application from "../../application";
import Graph from "../graph";
import LayoutControl from "../model/layoutControl";
import editableGraph from "../model/editableGraph";
import Add from "../../action/add";
import Remove from "../../action/remove";
import Update from "../../action/update";
import Regulator from "../../entity/Regulator";
import Metabolite from "../../entity/metabolic/Metabolite";
import Dominance from "../../entity/Dominance";

export default (readonly, edgeStyle) => {
	let selection, select, update, onDblClick, edgeClick, canLabelClick, onLabelClick, canEdgeClick, canEdgeSelect, canNodeDrag, canClip, onClip, onLabelEdit, onNodeClick, onEdgeSelect, onContextMenu, isEditMode, onKeyUp;

	if (!readonly) {
		const mapSubSelection = (props, allnodes, edges, ssEdges) => {
			props.subSelected && Seq(props.subSelected).forEach(v=>{Seq(v).filter(e=>e).forEach(e => {
				const sid = e.metaboliteId;
				const s = props.model.Metabolite[sid];
				const t = e.root || e.parent;
				const tid = t.id;

				const ed = edges[sid] || (edges[sid] = {}), ssed = ssEdges[sid] || (ssEdges[sid] = {});
				ed[tid] = ssed[tid] = ed[tid] || {source: sid, target: t};
				allnodes[sid] = allnodes[sid] || s; allnodes[tid] = allnodes[tid] || t;
			});});
		};

		selection = (self, props, ed) => {
			let nodes, allnodes, edges, ssEdges, metabolite = (props.selected || {}).Metabolite;

			if (metabolite) {
				allnodes = {}, nodes = {}, edges = {}, ssEdges = {};
				if(props.modeEdit){
					nodes[metabolite.id] = allnodes[metabolite.id] = metabolite;
				}else{ 
					// metabolite.neighbors(nodes, edges);
					allnodes = nodes;
				}
				mapSubSelection(props, allnodes, edges, ssEdges);
				if(props.modeEdit){
					const ed = {};
					// metabolite.neighbors({}, ed);
					for( const sid in edges ) {
						for( const tid in edges[sid] ) {
							if((ed[tid] || {})[sid]) (edges[tid] || (edges[tid] = {}))[sid] = edges[tid][sid] || {source: tid, target: props.model.Metabolite[sid]};
						}
					}
				}

				allnodes = self.transformNodes(props, Seq(allnodes), {});
				nodes = Seq(nodes).map((_,k) => allnodes[k]).toObject();
				nodes[metabolite.id].style = "selected";
				if(self.state.editing){ nodes[metabolite.id].label = ""; }
				self.adjustMoving(nodes);
				edges = self.transformEdges(
					props,
					Seq(edges).map(e => Seq(e).valueSeq()).valueSeq().flatten(true).map( e => ({ source: e.source, target: e.target })),
					allnodes,
					(e, props)=> ((ssEdges[e.source] || {})[e.target.id] ? "selectedEdge" : (props.modeEdit ? "invisibleEdge" : undefined))
				);
				NetViz.layout.normalize(allnodes = Seq(allnodes).toArray(), self.dimension);
				nodes = Seq(nodes).toArray();
			}
			self.selectionRef.current.self.set(nodes, Seq(edges).map(v=>{
				if(v.source === "number") v.source = allnodes[v.source];
				if(v.target === "number") v.target = allnodes[v.target];
				return v;
			}).toArray()).draw();
		};
		select     = (self, e) => (self.props.actions.onSelect(e || "Metabolite"), self.setState({editing: false}), true);

		isEditMode = (e, {modeEdit, editable}) => !readonly && editable && modeEdit^e.ctrlKey;
		canEdgeSelect = (e, _, props) => !props.readonly;
		canLabelClick = (e, n, props) => (props.editable && isEditMode(e, props));
		onLabelClick  = (e, props, n, self) => isEditMode(e, props) && !e.shiftKey && (( select(self, n), self.setState({editing: true, focusAll: false}), true) );
		onLabelEdit   = (self, l) => { const is = (l !== undefined && self.props.selected && self.props.selected.Metabolite && (self.props.actions.onEdit(self.props.selected.Metabolite, "name", l), true)); self.setState({editing: false}); return is;};

		onNodeClick   = (e, props, el) => {
			if(e.shiftKey && isEditMode(e, props)){
				(el.isExternal || Seq(el.upStreams).isEmpty()) && props.actions.onEdit(el, "isExternal", !el.isExternal);
				return true;
			}
		};

		onEdgeSelect = (e, {model: model, actions: {onSubSelect}}, el) => {
			const adding = (s, t, type) => (t.id == el.target.id && s == el.source);

			const regs = Seq(model.Regulator).filter(e => adding(e.metaboliteId, e.parent))
				.concat(Seq(model.ConditionMetabolite).filter(e => adding(e.metaboliteId, e.root)))
				.concat(Seq(model.SubConditionMetabolite).filter(e => adding(e.metaboliteId, e.root))).toArray();

			const comp = e = Seq(regs).first();
			onSubSelect( comp.root || comp.parent , regs);
			return true;
		};
		canEdgeClick = (e, {target, source}, props) => {
			if(!isEditMode(e, props)) return false;
			let ssedg;
			mapSubSelection(props, {}, {}, ssedg = {});
			if((ssedg[source] || {})[target.id]) return false;  //cannot click on selected edge]
			const f = e => Seq(e).filter(e =>  e.metaboliteId == source );
			const r = f(target.upStreams).first();
			return r && Seq(target.upStreams).reduce((v, e) => (v > 1 ? v : v + (e.metaboliteId == source) + Seq(e.conditions).reduce((v, e) => v + f(e.metabolites).count() +
								Seq(e.conditions).reduce((v, e) => v + f(e.metabolites).count(), 0), 0)), 0) === 1 && r;
		};
		edgeClick = (e, props, el) => {
			if(e.shiftKey){
				//el1
				const getNegAndPos = (el, target) => ({
					negative: !el.type ? target : el,
					positive: !el.type ? el : target
				});
				(el = canEdgeClick(e, {target: el.target.entity, source: el.source.entity.id}, props)) &&
										props.actions.batch(
											Seq([new Update(el, "type", !el.type)])
												.concat(Seq(el.type ? el.dominants : el.recessives).map(e => new Remove(e)))
												.concat(Seq((el.parent).upStreams).filter(v => v !== el && (!el.type ^ v.type) ).map(v => new Add(new Dominance(getNegAndPos(el, v)))))
												.toArray()
										);
				return true;
			}
		};

		canClip = (dragging, e) => (e.nodes.length > 0 ? {nStyle: !e.nodes[0].node.entity.isExternal && Seq(e.nodes[0].node.entity.upStreams).filter(v => v.metabolite === dragging.entity).isEmpty() ? "nodeAccepted" : "nodeDenied", clipTo: e.nodes[0].node, circle: e.nodes[0].node.uniqid == dragging.entity.id} : undefined);
		canNodeDrag = (el, e, {props}) => isEditMode(e, props);
		onClip  = (dragging, e, {actions}) => {
			const from = dragging.entity;
			if(canClip(dragging, e).nStyle == "nodeAccepted"){
				const to   = e.nodes[0].node.entity;

				const adding = new Regulator({ parent: to, metabolite: from, type: true, conditionRelation: false });
				//all negative regulators
				const negatives = Seq(to.upStreams).filterNot(e=>e.type);
				const dominances = negatives.map(negative => new Add(new Dominance({ positive: adding, negative })));
				actions.batch(Seq([new Add(adding)]).concat(dominances));
			}
		};

		onKeyUp = (e, {props}) => {
			if(props.deleteKey){
				if( !isEditMode(e,props) || (e.keyCode || e.which) !== 46 || !props.selected.Metabolite || !props.selected) return;

				const subNodes = Seq(props.subSelected).map( v=> Seq(v).valueSeq() ).valueSeq().flatten(true);
				if(!subNodes.isEmpty()) {  props.actions.onSelect(props.selected.Metabolite); props.actions.batch(Seq(subNodes).map(v=>new Remove(v)).toArray()); }
				else { props.actions.onRemove(props.selected.Metabolite); }
			}
		};
		onDblClick = (e, self) => {
			if(!isEditMode(e, self.props) || e.shiftKey) return;

			const te = self.transformCoords(e, self.defaultDimension);
			const c = new Metabolite({
				speciesId: Application.defNameExt(self.props.model.Metabolite, "m", /^m[A-Z]\d*$/i),
				name: Application.defNameExt(self.props.model.Metabolite, "", /^[A-Z]\d*$/i),
				x: te.x,
				y: te.y
			});
			let b = Seq([new Add(c, true)]);
			!b.isEmpty() && self.props.actions.batch(b); b = Seq([]);
			if(!self.props.selected.Layout){ b = b.concat(LayoutControl.creator(Application.defName(self.props.model.Layout, "New Layout "), self.props.model.Metabolite, self.props.editable, c, lc=>{
				const te = self.transformCoords(e, lc.root);
				lc.x = te.x; lc.y = te.y;
				return lc;
			}, self.defaultDimension));
			}
			self.props.selected && Seq(c.layouts).forEach(lc=>{
				const te = self.transformCoords(e, lc.root);
				b = b.concat([new Update(lc, "x", te.x), new Update(lc, "y", te.y)]);
			});
			!b.isEmpty() && self.props.actions.batch(b);

			self.setState({editing: true, focusAll: true});
		};

		update = (self, props) => {
			props.selected && self.props.selected && (props.selected.Metabolite !== self.props.selected.Metabolite || props.modeEdit !== self.props.modeEdit || props.subSelected !== self.props.subSelected) && selection(self, props);
			!props.modeEdit && self.editing && self.setState({editing: false});
		};
	}

	const interactivity = { canLabelClick: canLabelClick ? (e,el,props)=>canLabelClick(e, el.label.entity, props) : undefined, onLabelEdit: onLabelEdit, onLabelClick: onLabelClick,
		canNodeDblClick: canLabelClick, onNodeDblClick: onLabelClick,
		canNodeClick: () => true, onNodeClick,
		onEdgeClick: edgeClick, canEdgeClick: canEdgeClick ? (e, el,props)=>canEdgeClick(e, el.edge.entity, props) : undefined,
		onEdgeSelect: onEdgeSelect, canEdgeSelect: canEdgeSelect, canNodeDrag:canNodeDrag, canClip:canClip, onClip:onClip, onDblClick: onDblClick,
		onKeyUp: onKeyUp

	};

	return editableGraph(readonly, { node: Graph.nodeStyleMap, selection: Graph.styles.selected, dragging: Graph.styles.dragging}, selection, select, update, null, edgeStyle, interactivity);
};
