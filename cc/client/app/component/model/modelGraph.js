import { Seq } from "immutable";
import NetViz from "ccnetviz";
import Application from "../../application";
import Graph from "../graph";
import LayoutControl from "./layoutControl";
import editableGraph from "./editableGraph";
import Add from "../../action/add";
import Remove from "../../action/remove";
import Update from "../../action/update";
import Regulator from "../../entity/Regulator";
import Component from "../../entity/Component"; 
import Dominance from "../../entity/Dominance";

export default (readonly, edgeStyle, { modelType = "boolean" } = {}) => {
	let selection, select, update, onDblClick, edgeClick, canLabelClick, onLabelClick, canEdgeClick, canEdgeSelect,
		canNodeDrag, canClip, onClip, onLabelEdit, onNodeClick, onEdgeSelect, onContextMenu, onKeyUp, onNodeDblClick;

	if (!readonly) {
		const mapSubSelection = (props, allnodes, edges, ssEdges) => {
			props.subSelected && Seq(props.subSelected).forEach(v => {
				Seq(v).filter(e => e).forEach(e => {
					const sid = e.componentId;
					const s = props.model.Component[sid];
					const t = e.root || e.parent;
					const tid = t.id;

					const ed = edges[sid] || (edges[sid] = {}), ssed = ssEdges[sid] || (ssEdges[sid] = {});
					ed[tid] = ssed[tid] = ed[tid] || { source: sid, target: t };
					allnodes[sid] = allnodes[sid] || s; allnodes[tid] = allnodes[tid] || t;
				});
			});
		};

		selection = (self, props, ed) => {
			let nodes, allnodes, edges, ssEdges, component = (props.selected || {}).Component;

			if (component) {
				allnodes = {}, nodes = {}, edges = {}, ssEdges = {};
				nodes[component.id] = allnodes[component.id] = component;

				mapSubSelection(props, allnodes, edges, ssEdges);
				const ed = {};
				component.neighbors({}, ed);
				for (const sid in edges) {
					for (const tid in edges[sid]) {
						if ((ed[tid] || {})[sid]) (edges[tid] || (edges[tid] = {}))[sid] = edges[tid][sid] || { source: tid, target: props.model.Component[sid] };
					}
				}


				allnodes = self.transformNodes(props, Seq(allnodes), {});
				nodes = Seq(nodes).map((_, k) => allnodes[k]).toObject();
				let node = nodes[component.id];
				if (node.entity === self.state.movableNode) {
					node.style = 'movable'
				} else {
					node.style = 'selected';
				}
				if (self.state.editing) { nodes[component.id].label = ""; }
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
			self.selectionRef.current.self.set(nodes, Seq(edges).map(v => {
				if (v.source === "number") v.source = allnodes[v.source];
				if (v.target === "number") v.target = allnodes[v.target];
				return v;
			}).toArray()).draw();
		};
		select = (self, e) => {
			if (self.props.handleSelect !== undefined){
				(self.props.handleSelect(e || "Component", self.props.actions), self.setState({ editing: false }), true);
			} else {
				(self.props.actions.onSelect(e || "Component"), self.setState({ editing: false }), true);
			}	
		};

		canEdgeSelect = (e, _, props) => !props.readonly;
		canLabelClick = (e, _, props) => props.editable;
		onLabelClick = (e, props, n, self) => !e.shiftKey && ((select(self, n), self.setState({ editing: true, focusAll: false }), true));
		onLabelEdit = (self, l) => { const is = (l !== undefined && self.props.selected && self.props.selected.Component && (self.props.actions.onEdit(self.props.selected.Component, "name", l), true)); self.setState({ editing: false }); return is; };

		onNodeClick = (e, props, el) => {
			if (e.shiftKey) {
				(el.isExternal || Seq(el.upStreams).isEmpty()) && props.actions.onEdit(el, "isExternal", !el.isExternal);
				return true;
			}
		};

		onEdgeSelect = (e, { model: model, actions: { onSubSelect } }, el) => {
			const adding = (s, t, type) => (t.id == el.target.id && s == el.source);

			const regs = Seq(model.Regulator).filter(e => adding(e.componentId, e.parent))
				.concat(Seq(model.ConditionSpecies).filter(e => adding(e.componentId, e.root)))
				.concat(Seq(model.SubConditionSpecies).filter(e => adding(e.componentId, e.root))).toArray();

			const comp = e = Seq(regs).first();
			onSubSelect(comp.root || comp.parent, regs);
			return true;
		};
		canEdgeClick = (e, { target, source }, props) => {
			let ssedg;
			mapSubSelection(props, {}, {}, ssedg = {});
			if ((ssedg[source] || {})[target.id]) return false;  //cannot click on selected edge]
			const f = e => Seq(e).filter(e => e.componentId == source);
			const r = f(target.upStreams).first();
			return r && Seq(target.upStreams).reduce((v, e) => (v > 1 ? v : v + (e.componentId == source) + Seq(e.conditions).reduce((v, e) => v + f(e.components).count() +
				Seq(e.conditions).reduce((v, e) => v + f(e.components).count(), 0), 0)), 0) === 1 && r;
		};
		edgeClick = (e, props, el) => {
			if (e.shiftKey) {
				//el1
				const getNegAndPos = (el, target) => ({
					negative: !el.type ? target : el,
					positive: !el.type ? el : target
				});
				(el = canEdgeClick(e, { target: el.target.entity, source: el.source.entity.id }, props)) &&
					props.actions.batch(
						Seq([new Update(el, "type", !el.type)])
							.concat(Seq(el.type ? el.dominants : el.recessives).map(e => new Remove(e)))
							.concat(Seq((el.parent).upStreams).filter(v => v !== el && (!el.type ^ v.type)).map(v => new Add(new Dominance(getNegAndPos(el, v)))))
							.toArray()
					);

				
				return true;
			}

		};

		canClip = (dragging, e) => (e.nodes.length > 0 ? { nStyle: !e.nodes[0].node.entity.isExternal && Seq(e.nodes[0].node.entity.upStreams).filter(v => v.component === dragging.entity).isEmpty() ? "nodeAccepted" : "nodeDenied", clipTo: e.nodes[0].node, circle: e.nodes[0].node.uniqid == dragging.entity.id } : undefined);
		onClip = (dragging, e, { actions }) => {
			const from = dragging.entity;
			if (canClip(dragging, e).nStyle == "nodeAccepted") {
				const to = e.nodes[0].node.entity;
				const adding = new Regulator({ parent: to, component: from, species: from, type: true, conditionRelation: false });
				//all negative regulators
				const negatives = Seq(to.upStreams).filterNot(e => e.type);
				const dominances = negatives.map(negative => new Add(new Dominance({ positive: adding, negative })));
				actions.batch(Seq([new Add(adding)]).concat(dominances));
			}
		};

		onKeyUp = (e, { props }) => {
			if (props.deleteKey) {
				if ((e.keyCode || e.which) !== 46 || !props.selected.Component || !props.selected) return;

				const subNodes = Seq(props.subSelected).map(v => Seq(v).valueSeq()).valueSeq().flatten(true);
				if (!subNodes.isEmpty()) { props.actions.onSelect(props.selected.Component); props.actions.batch(Seq(subNodes).map(v => new Remove(v)).toArray()); }
				else { props.actions.onRemove(props.selected.Component); }
			}
		};
		onDblClick = (e, self) => {
			if (e.shiftKey) return;

			const now = Date.now();
			const COOLDOWN_MS = 400;
			if (self.__dblCooldownUntil && now < self.__dblCooldownUntil) return;
			self.__dblCooldownUntil = now + COOLDOWN_MS;

			if (self.__dblBusy) return;
  		self.__dblBusy = true;

			try {
					const te = self.transformCoords(e, self.defaultDimension);	
					const c = new Component({ name: Application.defNameExt(self.props.model.Component, "", /^[A-Z]\d*$/i), isExternal: false, x: te.x, y: te.y });
					let b = Seq([new Add(c, true)]);

					if (self.props.selected && self.props.selected.Layout) {
						const _updateC = {x:0, y:0};
						setTimeout(() => {
							let _batch = Seq([]);
							_batch = _batch.concat(LayoutControl.creator(
								undefined,
								self.props.model.Component,
								self.props.editable,
								c,
								(lc) => {
									const te = self.transformCoords(e, lc.root);
									lc.x = te.x; lc.y = te.y;
									_updateC.x = te.x;
									_updateC.y = te.y;
									return lc;
								},
								null,
								self.props.selected.Layout
							));
							const cacheC = self.props.selected.Layout.components[c.id].component;
							_batch = _batch.concat(new Update(cacheC, "x", _updateC.x));
							_batch = _batch.concat(new Update(cacheC, "y", _updateC.y));
							!_batch.isEmpty() && self.props.actions.batch(_batch);
						}, 600);
					} else {
						setTimeout(() => {
							self.props.actions.batch(LayoutControl.creator(
								Application.defName(self.props.model.Layout, "New Layout "),
								self.props.model.Component,
								self.props.editable,
								c, (lc) => {
									const te = self.transformCoords(e, lc.root);
									lc.x = te.x; lc.y = te.y;
									return lc;
								},
								self.defaultDimension
							));
						}, 600);
					}
					!b.isEmpty() && self.props.actions.batch(b); b = Seq([]);
			} finally {
					self.__dblBusy = false;
			}

			self.setState({ editing: true, focusAll: true });
		};
		onNodeDblClick = (e, props, el, self, graph) => {
			if (!e.shiftKey) {
				self.setState({ movableNode: el });
				selection && selection(self, props);
			}
		};
		update = (self, props) => {
			props.selected && self.props.selected && (props.selected.Component !== self.props.selected.Component || props.subSelected !== self.props.subSelected) && selection(self, props);
			self.editing && self.setState({ editing: false });
		};
	}

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
};
