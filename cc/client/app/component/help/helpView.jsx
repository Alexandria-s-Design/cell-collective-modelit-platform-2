import React from "react";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";

export default view(({view}) => (
	<Panel {...view} >
		<Scrollable >

		</Scrollable>
	</Panel>
));