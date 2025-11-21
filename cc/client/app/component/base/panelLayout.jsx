import React from "react";
import Panel from "./panel";
import Scrollable from "./scrollable";

const PANEL_TYPE = (<Panel />).type;
const FRAGMENT_TYPE = (<React.Fragment />).type;

// TODO - include option for horizontal flowing (prerequisite - implement "fit" for width in the Panel class)
class PanelFlow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			panelRefs: [],
			invalidated: true
		};
	}

	componentDidMount() {
		this.updateRefs();
	}

	updateRefs() {
		const children = React.Children.toArray(this.props.children).length;

		let panelRefs = this.state.panelRefs;

		const totalRefs = this.state.panelRefs.length;
		if (totalRefs < children) {
			const refsToAdd = children - totalRefs;
			for (let i = 0; i < refsToAdd; i++) panelRefs.push(React.createRef());
		} else if (totalRefs > children) {
			panelRefs = panelRefs.slice(0, children);
		}

		this.setState({
			panelRefs,
			invalidated: true
		});
	}

	componentDidUpdate(prevProps) {
		if (prevProps.children !== this.props.children) {
			this.updateRefs();
		} else if (this.state.invalidated) {
			this.setState({
				invalidated: false
			});
		}
	}

	render() {
		let { top: offsetY, left: offsetX, view, spacing, scrollable } = this.props;

		const panels = React.Children.toArray(this.props.children).filter(e => e !== null).map(child => {
			if (child.type === FRAGMENT_TYPE) {
				return React.Children.toArray(child.props.children);
			} else if (child.type === PANEL_TYPE) {
				return child;
			} else {
				throw new Error("All children of PanelFlow must be Panels or Fragments that contain only Panels.");
			}
		}).flat();

		let height = 0;
		panels.forEach((child, idx) => {
			if (this.state.panelRefs[idx] && this.state.panelRefs[idx].current) {
				height += this.state.panelRefs[idx].current.getHeight();
				height += child.props.top; // use ORIGINAL child props, not the OUTPUT panel's calculated top value
				if (idx !== 0) {
					height += spacing;
				}
			}
		});

		const layoutStyle = {
			height,
			width: "100%"
		};

		let content = <div className="panel-layout" style={layoutStyle}>{panels.filter(child => child.props).map((child, idx) => {
			const heightCbk = child.props.fitOptions && typeof(child.props.fitOptions.heightChanged) === "function" && child.props.fitOptions.heightChanged;
			const heightChanged = (newHeight) => {
				heightCbk && heightCbk(newHeight);
				this.setState({
					invalidated: false // trigger re-render
				});
			};

			let height = "fit";
			if ('innerHeight' in child.props && 'layoutHeight' in child.props) {
				throw new Error("Only one of innerHeight and layoutHeight should be included in each child of PanelFlow.");
			} else if ('innerHeight' in child.props || 'layoutHeight' in child.props) {
				const preheight = child.props.innerHeight ? child.props.innerHeight : child.props.layoutHeight;
				const toAdd = child.props.innerHeight ? 12 : 0;
				if (typeof(preheight) === "function") {
					height = preheight(child.props) + toAdd;
				} else if (preheight === "vfill") {
					const containerHeight = view.parentHeight;
					const remaining = containerHeight - (offsetY + (child.props.top || 0));
					height = remaining; // ignore innerHeight/layoutHeight distinction
				} else {
					height = preheight + toAdd;
				}
			}

			const cloned = React.cloneElement(child, {
				top: offsetY + child.props.top,
				left: offsetX,
				height,
				fitOptions: {
					heightChanged
				},
				units: "px",
				ref: this.state.panelRefs[idx],
				...view
			});

			// if layout has been validated (i.e. refs have been changed)
			if (!this.state.invalidated) {
				offsetY += child.props.top || 0;
				offsetY += (this.state.panelRefs[idx] && this.state.panelRefs[idx].current) ? this.state.panelRefs[idx].current.getHeight() : 0; // panels that have just been added may not have their refs set yet
				offsetY += spacing;
			}

			return cloned;
		})}</div>;

		if (scrollable) {
			content = <div className="panel-layout-scroll" style={{height}}>{content}</div>;
		}

		return scrollable ? <Scrollable {...view} height={height} scrollSpeed={typeof(scrollable) === "boolean" ? 1 : scrollable}>{content}</Scrollable> : content;
	}
}

PanelFlow.defaultProps = {
	left: 0,
	top: 0,
	view: {},
	spacing: 0,
	scrollable: false,
	debug: false
}

const HeightFunctions = {
	TableHeight: (rowsVisible) => (props => {
		const { rowHeight, headHeight, searchHeight, search, data } = React.Children.only(props.children).props;
		return Math.min(rowsVisible, data.size) * rowHeight + headHeight + (search ? searchHeight : 0);
	})
}

export { PanelFlow, HeightFunctions };