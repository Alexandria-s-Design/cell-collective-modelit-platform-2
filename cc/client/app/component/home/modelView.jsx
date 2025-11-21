import React from "react";
import view from "../base/view";
import Panel from "../base/panel";
import modelGraph from "../model/modelGraph";

const ModelGraph = modelGraph(true);

export default view(props => {
	const e = props.master;
	return (
		<Panel {...props.view}>
			{e.id !== undefined && (e.type === "research" ? (<ModelGraph {...props} model={e} entities={e}/>) : null)}
		</Panel>
	);
}, e => e.title(e.master ? e.master.top : {}));