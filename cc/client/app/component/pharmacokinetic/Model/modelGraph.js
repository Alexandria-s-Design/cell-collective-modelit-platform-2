
import { Seq } from "immutable";
import NetViz from "ccnetviz";
import Application from "../../../application";
import Graph from "../../graph";
import LayoutControl from "../../model/layoutControl";
import editableGraph from "./editableGraph";
import Add from "../../../action/add";
import Remove from "../../../action/remove";
import Update from "../../../action/update";
import PKCompartment from "../../../entity/pharmacokinetic/Compartment";
import Rate from "../../../entity/pharmacokinetic/Rate";
import Parameter from "../../../entity/pharmacokinetic/Parameter";

export default (readonly, edgeStyle, { modelType = "boolean" } = {}) => {
	let selection, select, update, onDblClick, edgeClick, canLabelClick, onLabelClick, canEdgeClick, canEdgeSelect,
		canNodeDrag, canClip, onClip, onLabelEdit, onNodeClick, onEdgeSelect, onContextMenu, onKeyUp, onNodeDblClick;

	if (!readonly) {
		const isExternal = c => c.type !== "int";

		const mapSubSelection = (props, allnodes, edges, ssEdges) => {
			props.subSelected && Seq(props.subSelected).forEach(v => {
				Seq(v).filter(e => e).forEach(e => {
					const sid = e.toCompartmentId;// componentId
					const s = props.model.PKCompartment[sid];
					const t = e.root || e.fromCompartment;
					const tid = t.id;
					const ed = edges[sid] || (edges[sid] = {}), ssed = ssEdges[sid] || (ssEdges[sid] = {});
					ed[tid] = ssed[tid] = ed[tid] || { source: sid, target: t };
					allnodes[sid] = allnodes[sid] || s; allnodes[tid] = allnodes[tid] || t;
				});
			});
		};


		selection = (self, props, ed) => {

			let nodes, allnodes, edges, ssEdges, compartment = (props.selected || {}).PKCompartment;

			if (compartment) {
				allnodes = {}, nodes = {}, edges = {}, ssEdges = {};
				nodes[compartment.id] = allnodes[compartment.id] = compartment;

				mapSubSelection(props, allnodes, edges, ssEdges);
				const ed = {};
				compartment.neighbors({}, ed);
				for (const sid in edges) {
					for (const tid in edges[sid]) {
						if ((ed[tid] || {})[sid]) (edges[tid] || (edges[tid] = {}))[sid] = edges[tid][sid] || { source: tid, target: props.model.Compartment[sid] };
					}
				}
				allnodes = self.transformNodes(props, Seq(allnodes), {});
				nodes = Seq(nodes).map((_, k) => allnodes[k]).toObject();
				let node = nodes[compartment.id];
				if (node.entity === self.state.movableNode) {
					node.style = 'movable'
				} else {
					node.style = 'selected';
				}
				if (self.state.editing) { nodes[compartment.id].label = ""; }
				self.adjustMoving(nodes);
				edges = self.transformEdges(
					props,
					Seq(edges).map(e => Seq(e).valueSeq()).valueSeq().flatten(true).map(e => ({ source: e.source, target: e.target })),
					allnodes,
					(e, props) => ((ssEdges[e.source] || {})[e.target.id] ? "selectedEdge" : (props.modeEdit ? "invisibleEdge" : undefined))
				);
				NetViz.layout.normalize(allnodes = Seq(allnodes).toArray(), self.dimension);
				nodes = Seq(nodes).toArray();
			}
			self.refs.selection.self.set(nodes, Seq(edges).map(v => {
				if (v.source === "number") v.source = allnodes[v.source];
				if (v.target === "number") v.target = allnodes[v.target];
				return v;
			}).toArray()).draw();
		};

		select = (self, e) => (self.props.actions.onSelect(e || "PKCompartment"), self.setState({ editing: false }), true);


		canEdgeSelect = (e, _, props) => !props.readonly;

		canLabelClick = (e, _, props) => props.editable;


		onLabelClick = (e, props, n, self) => !e.shiftKey && ((select(self, n), self.setState({ editing: true, focusAll: false }), true));


		onLabelEdit = (self, l) => { const is = (l !== undefined && self.props.selected && self.props.selected.PKCompartment && (self.props.actions.onEdit(self.props.selected.Compartment, "name", l), true)); self.setState({ editing: false }); return is; };

		onNodeClick = (e, props, el) => {
			if (e.shiftKey) {
				(isExternal(el) || Seq(el.upStreams).isEmpty()) && props.actions.onEdit(el, "type", isExternal(el) ? "int": "ext");
				return true;
			}
		};

		onEdgeSelect = (e, { model: model, actions: { onSubSelect } }, el) => {
			const adding = (s, t) => (t == el.source.uniqid && s == el.target.uniqid);
			const rates = Seq(model.Rate).filter(e => adding(e.fromCompartmentId, e.toCompartmentId)).toArray();
			const comp = e = Seq(rates).first();
			onSubSelect(comp.fromCompartment, rates);
			return true;
		};


		canEdgeClick = (e, { target, source }, props) => {
			// let ssedg;
			// mapSubSelection(props, {}, {}, ssedg = {});
			// if((ssedg[source] || {})[target.id]) return false;  //cannot click on selected edge]
			// const f = e => Seq(e).filter(e =>  e.componentId == source );
			// const r = f(target.upStreams).first();
			// return r && Seq(target.upStreams).reduce((v, e) => (v > 1 ? v : v + (e.componentId == source) + Seq(e.conditions).reduce((v, e) => v + f(e.components).count() +
			//           Seq(e.conditions).reduce((v, e) => v + f(e.components).count(), 0), 0)), 0) === 1 && r;
			return true;

		};

		edgeClick = (e, props, el) => {
			//onEdgeSelect(e, props, el)

			const adding = (s, t) => (s == el.source.uniqid && t == el.target.uniqid);
			const rates = Seq(props.model.Rate).filter(e => adding(e.fromCompartmentId, e.toCompartmentId)).toArray();
			const comp = e = Seq(rates).first();
			props.actions.onSelect(comp);
			return true;
		}

		canClip = (dragging, e) => (
			e.nodes.length > 0 ?
				{
					// checks whether the first node is external
					// and whether none of its upstream components have the same entity as the dragging entity
					nStyle: ! isExternal(e.nodes[0].node.entity) &&
						Seq(e.nodes[0].node.entity.upStreams).filter(v => v.compartment === dragging.entity).isEmpty()
						? "nodeAccepted" : "nodeDenied",

					clipTo: e.nodes[0].node,
					circle: e.nodes[0].node.uniqid == dragging.entity.id // has circular dep
				}
				: undefined
		);


		onClip = (dragging, e, { actions, model }) => {
			const from = dragging.entity;
			if (canClip(dragging, e).nStyle == "nodeAccepted") {
				const to = e.nodes[0].node.entity;
				const adding = new Rate({ fromCompartment: from, toCompartment: to });	
				const fractionParameter = new Parameter({ name: Application.defNameExt(model.Parameter, "Fraction", /^Fraction[A-Z]\d*$/i), type: "fraction", value: 1, rate: adding });
				const kParameter = new Parameter({ name: Application.defNameExt(model.Parameter, "K", /^K[A-Z]\d*$/i), type: "K", value: 1, value_type: "inst", rate: adding });
				actions.batch([new Add(adding), new Add(fractionParameter), new Add(kParameter)]);
			}
		};

		onKeyUp = (e, { props }) => {
			if (props.deleteKey) {
				if ((e.keyCode || e.which) !== 46 || !props.selected.PKCompartment || !props.selected) return;

				const subNodes = Seq(props.subSelected).map(v => Seq(v).valueSeq()).valueSeq().flatten(true);
				if (!subNodes.isEmpty()) {
					props.actions.onSelect(props.selected.PKCompartment);
					props.actions.batch(Seq(subNodes).map(v => new Remove(v)).toArray());
				} else {
					props.actions.onRemove(props.selected.PKCompartment);
				}
			}
		};

		onDblClick = (e, self) => {
			if (e.shiftKey) return;
			const te = self.transformCoords(e, self.defaultDimension);
			//const c = new Component({ name: Application.defNameExt(self.props.model.Component, "", /^[A-Z]\d*$/i), isExternal: false, x: te.x, y: te.y });
			const c = new PKCompartment({
				name: Application.defNameExt(self.props.model.PKCompartment, "c", /^c[A-Z]\d*$/i),
				type: "int",
				cmp: "drug",
				x: te.x,
				y: te.y
			});
			let b = Seq([new Add(c, true)]);

			!b.isEmpty() && self.props.actions.batch(b); b = Seq([]);

			if (!self.props.selected.Layout) {
				b = b.concat(
					LayoutControl.creator(
						Application.defName(self.props.model.Layout, "New Layout "),
						self.props.model.PKCompartment,
						self.props.editable,
						c,
						lc => {
							const te = self.transformCoords(e, lc.root);
							lc.x = te.x;
							lc.y = te.y;
							return lc;
						},
						self.defaultDimension
					)
				);
			}

			self.props.selected && Seq(c.layouts).forEach(lc => {
				const te = self.transformCoords(e, lc.root);
				b = b.concat([new Update(lc, "x", te.x), new Update(lc, "y", te.y)]);
			});

			!b.isEmpty() && self.props.actions.batch(b);
			self.setState({ editing: true, focusAll: true });
		};


		onNodeDblClick = (e, props, el, self, graph) => {
			if (!e.shiftKey) {
				self.setState({ movableNode: el });
				selection && selection(self, props);
			}
		};


		update = (self, props) => {
			props.selected && self.props.selected && (props.selected.PKCompartment !== self.props.selected.PKCompartment || props.subSelected !== self.props.subSelected) && selection(self, props);
			self.editing && self.setState({ editing: false });
		};

	};

	const interactivity = {
		canLabelClick: canLabelClick ? (e, el, props) => canLabelClick(e, el.label.entity, props) : undefined,
		onLabelEdit: onLabelEdit,
		onLabelClick: onLabelClick,
		canNodeDblClick: canLabelClick,
		onNodeDblClick: onNodeDblClick,
		canNodeClick: () => true,
		onNodeClick,
		onEdgeClick: edgeClick,
		canEdgeClick: canEdgeClick ? (e, el, props) => canEdgeClick(e, el.edge.entity, props) : undefined,
		onEdgeSelect: onEdgeSelect,
		canEdgeSelect: canEdgeSelect,
		canNodeDrag: () => true,
		canClip: canClip,
		onClip: onClip,
		onDblClick: onDblClick,
		onKeyUp: onKeyUp

	};

	return editableGraph(readonly, { node: Graph.nodeStyleMap, selection: Graph.styles.selected, dragging: Graph.styles.dragging }, selection, select, update, null, edgeStyle, interactivity);
}
