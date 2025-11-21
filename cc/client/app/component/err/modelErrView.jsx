import React from "react";
import view from "../base/view";
import Panel from "../base/panel";

import "./style.scss"

export default view(props => (
		<Panel {...props.view} className="errView">
			<div className="err">We&apos;re Sorry, but there seems to be an error. Kindly contact us at <a href="mailto:info@discoverycollective.com">info@discoverycollective.com</a> to resolve the same.</div>
		</Panel>
));