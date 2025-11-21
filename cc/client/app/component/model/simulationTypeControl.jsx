import React from "react";
import { Seq } from "immutable";
import Options from "../base/options";
import { FormattedMessage } from "react-intl";

const options = Seq({
	SYNCHRONOUS: "Synchronous",
	ASYNCHRONOUS: "Asynchronous"
}).map((v, k) => ({ id: k, name: v })).toObject();

export default ({value, onChange: change}) => (
	<dl>
		<dt>
			<FormattedMessage id="ModelDashboard.simulationTypeControl.labelUpdating" defaultMessage="Updating:"/>
		</dt>
		<Options value={options[value]} def={options.SYNCHRONOUS} options={Seq(options)} enabled={change} onChange={e => change(e && e.id)}/>
	</dl>
);