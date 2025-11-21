import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import view from "../base/view";
import Panel from "../base/panel";
import modelGraph from "../model/modelGraph";
import LayoutControl from "../model/layoutControl";
import { handleSelect } from "./pagesView";

const ModelGraph = modelGraph(false, (e, {model: {Component: map}}) => {
	const page = Seq(e.target.pages).first();
	if (page) {
		const name = map[e.source].name;
		const section = Seq(page.sections).filter(e=>e).find(e => e.type === "UpstreamRegulator" && e.title === name);
		if (section) return Seq(section.contents).some(e => e.references) ? "positive" : "warning";
	}
	return "error";
});

class Content extends React.Component {
	render() {
		const props = {...this.props, handleSelect };
		return (
			<Panel {...props.view}>
				<ModelGraph {...props} ref="self" editable={false}/>
			</Panel>
		);
	}
}

const Actions = (props, ref) => {
	const e = props.model;
	return {
		layout: (<span><LayoutControl {...props} editable={false}/></span>),
		download: Seq(e.Component).size && (() => Utils.downloadBinary(e.name + ".png", ref("self").image))
	};
};

export default view(Content, null, Actions);