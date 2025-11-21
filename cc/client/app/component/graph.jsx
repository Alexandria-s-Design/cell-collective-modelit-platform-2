import React, {createRef} from "react";
import ReactDom from "react-dom";
import { Seq } from "immutable";
import NetViz from "ccnetviz";
import Utils from "../utils";

export default class Graph extends React.Component {
	constructor(props) {
    super(props);
    this.state = {isDragging: false, potentialDragStartEvent: null};  
		this.canvasRef = createRef();
	}

	shouldComponentUpdate() {
		return false;
	}
	UNSAFE_componentWillReceiveProps(props) {
		if (this.self && (props.parentWidth !== this.props.parentWidth || props.parentHeight !== this.props.parentHeight)) {
			this.self.resize();
			this.self.draw();
		}
	}
	componentDidMount() {
		const props = this.props;
		const s = props.size;

		if (this.canvasRef.current) {
			this.self = new NetViz(this.canvasRef.current, {
				styles: Seq(Graph.styles.base)
					.concat(Graph.styles.extended, props.styles)
					.toObject(),
				onChangeViewport: props.onChangeViewport,
				onLoad: props.onLoad,
				onClick: props.onClick && this.onClick.bind(this),
				onDblClick: props.onDblClick && this.onDblClick.bind(this),
				onContextMenu: props.onContextMenu && this.onContextMenu.bind(this),
				onDrag: props.onDrag && {
					start: this.onDragStart.bind(this),
					drag: this.onDrag.bind(this),
					stop: this.onDragStop.bind(this),
				},
				getNodesCnt: props.getNodesCnt && (() => props.getNodesCnt.nodesNum),
				getEdgesCnt: props.getEdgesCnt && (() => props.getEdgesCnt.edgesNum),
			});
		}
	}
	componentWillUnmount() {
		if (this.self) {
			if (typeof this.self.cleanup === 'function') {
				this.self.cleanup();
			}
			this.self = null;
		}
	}
	transform(e, radius) {
		const rect = this.canvasRef.current && this.canvasRef.current.getBoundingClientRect();
		return ( this.self && rect && this.self.getLayerCoords({ radius: radius, x: e.clientX - rect.left, y: e.clientY - rect.top }) ) || {};
	}
	transformInv(e) {
		if(!this.self) return;
		const rect = this.canvasRef.current.getBoundingClientRect();
		const r = this.self.getScreenCoords(e);
		r.x -= rect.left; r.y -= rect.top;
		return r;
	}
	get image() {
		const e = this.self;
		e.draw();
		return e.image();
	}
	find(e) {
		if (e.type && e.type.includes('touch')) {
			const touch = e.changedTouches[0];
			if (touch) {
				e.clientX = touch.clientX;
				e.clientY = touch.clientY;
			}
		}
		e = this.transform(e, 5);
		return this.self && this.self.find(e.x, e.y, e.radius, this.props.nodesClickable || this.props.onNodeHover, this.props.edgesClickable, this.props.canLabelClick);
	}
	onDblClick(e) {
		this.props.onDblClick(e, this.find(e), this);
	}
	onContextMenu(e) {
		this.props.onContextMenu(e, this.find(e));
	}
	onClick(e) {
		const el = this.find(e);
		if((el.nodes || []).length > 0)
			{this.props.onClick(e, el.nodes[0]);}
		else if((el.labels || []).length > 0)
			{this.props.onClick(e, el.labels[0]);}
		else if((el.edges || []).length > 0)
			{this.props.onClick(e, el.edges[0]);}
		else
			{this.props.onClick(e, null);}
	}
	onMouseMove(e) {
		const f = this.find(e);
		const eCnt = (f.edges || []).length;
		const nCnt = (f.nodes || []).length;
		const lCnt = (f.labels = Seq(f.labels || []).filter((v=>v.dist <= 1)).toArray()).length;

		let cnt = 0;
		this.props.onNodeHover && ( cnt = this.props.onNodeHover(e, nCnt && f.nodes[0]) || 0 );
		if(nCnt && this.props.nodesClickable  && this.props.nodesClickable(e, f.nodes[0])){ cnt += nCnt; }
		if(lCnt && this.props.canLabelClick && this.props.canLabelClick(e, f.labels[0])){ cnt += lCnt; }
		if(eCnt && this.props.edgesClickable && this.props.edgesClickable(e, f.edges[0])){ cnt += eCnt; }


		this.canvasRef.current.classList[cnt ? "add" : "remove"]("pointer");
	}
	onDragStop(e){
		return this.props.onDrag.stop && this.props.onDrag.stop(e, this.find(e));
	}
	onDrag(e){
		return this.props.onDrag.drag && this.props.onDrag.drag(e, this.find(e));
	}
	onDragStart(e) {
		let els;
		return (els = this.find(e)).nodes.length && this.props.onDrag.start(els.nodes[0].node.uniqid, e);
	}
	onTouchStart(e) {
		this.setState({ isDragging: false, potentialDragStartEvent: e });
	}

	onTouchMove(e) {
		if(!this.state.isDragging) {
			let els;
			this.setState({ isDragging: true });
			return (els = this.find(this.state.potentialDragStartEvent)).nodes.length && this.props.onDrag.start(els.nodes[0].node.uniqid, this.potentialDragStartEvent);
		}
		this.setState({ potentialDragStartEvent: null });
		return this.props.onDrag.drag && this.props.onDrag.drag(e, this.find(e));
	}

	onTouchEnd(e) {
		if (this.state.isDragging) {
			this.setState({ isDragging: false});
			return this.props.onDrag.stop && this.props.onDrag.stop(e, this.find(e));
		}
		this.setState({ isDragging: false});
	}

	render() {
		return (
			!NetViz.isWebGLSupported()
				?
				<div className="graphErrBox">WebGL initialization failed.</div>
				:
				<canvas ref={this.canvasRef} onTouchMove={this.onTouchMove.bind(this)} onTouchEnd={this.onTouchEnd.bind(this)} onTouchStart={this.onTouchStart.bind(this)} onMouseMove={(this.props.onNodeHover || this.props.nodesClickable || this.props.edgesClickable || this.props.canLabelClick || this.onClick) && this.onMouseMove.bind(this)}/>
		);
	}
}

Graph.defaultProps = { styles: {} };

Graph.styles = (function() {
	const node = "/assets/images/circle.png";
	const movableNode = "/assets/images/movable.png";
	const arrow = { texture: "/assets/images/arrow.png", hideSize: 2 };

	const font = {
		type:     "sdf",
		pbf:      "/assets/fonts/Ubuntu_L_0-255.pbf",
	};


	const selected = "rgb(53, 152, 219)"; // blue

	return {
		versions: {
			background: { color: "rgba(0, 0, 0, 0)" },
			selected: { color: selected },
			mine: { color: "rgb(128, 128, 128)" }
		},
		base: {
			background: { color: "rgba(0, 0, 0, 0)" },
			node: { texture: node },
			edge: { arrow: arrow },
			internal: { color: "rgb(128, 128, 128)" },
			external: { color: "rgb(243, 156, 17)" },
			positive: { color: "rgb(171, 237, 199)" },
			negative: { color: "rgb(244, 172, 164)" },
			"positive delay": { color: "rgb(39, 174, 97)", type: "dotted" },
			"negative delay": { color: "rgb(232, 76, 61)", type: "dotted" },
			"condition delay": { color: "rgb(128, 128, 128)", type: "dotted" }
		},
		extended: {
			node: { texture: node, label: { color: "rgb(160,160,160)", hideSize: 9, minSize: 9, maxSize: 13, font: font } },
			selected: { color: selected },
			movable: { texture: movableNode, minSize: 32, color: "rgb(53, 152, 219)"},
			positiveRegulator: { color: "rgb(39, 174, 97)" },
			negativeRegulator: { color: "rgb(232, 76, 61)" },
			warning: { color: "rgb(247, 219, 111)" },
			error: { color: "rgb(244, 172, 164)" }
		},
		selected: {
			node: { texture: node, color: "rgb(208, 234, 241)" },
			edge: { arrow: arrow, color: selected },
			selectedEdge: { arrow: arrow, width: 3, size: 0, color: selected },
			invisibleEdge: { width: 0, arrow: { texture: "/assets/images/blank.png" } }
		},
		dragging: {
			node: { texture: node, color: "rgb(174, 174, 174)" },
			nodeAccepted: { texture: node, color: "rgb(0, 255, 0)" },
			nodeDenied: { texture: node, color: "rgb(255, 0, 0)" },
			edge: { arrow: arrow, color: selected }
		},
		selection: {
			node: { texture: "/assets/images/selected.png", color: "rgb(208, 234, 241)" },
		},
		stateGraph : {
			background: {color: "rgb(255, 255, 255)"},
			edge: {color: "rgb(204, 204, 204)"}
		}
	};
})();

Graph.draggingNodeStyleMap = {
	false: "internal",
	true: "external"
};


Graph.nodeStyleMap = {
	false: "internal",
	true: "external"
};

Graph.regulatorStyleMap = {
	false: "negativeRegulator",
	true: "positiveRegulator"
};

Graph.edgeStyleMap = {
	false: "negative",
	true: "positive",
	2: "condition"
};

Graph.edgeStyle = (v, e) => Utils.css(Graph.edgeStyleMap[v.type], (e = v.target.interactions) && e[v.source] && "delay");
