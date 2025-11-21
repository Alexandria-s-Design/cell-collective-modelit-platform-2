import React from "react";
import { Seq } from "immutable";
import Application from "../../application";
import Options from "../base/options";
import InitialState from "../../entity/initialState";
import { FormattedMessage } from "react-intl";

export default ({value, model, editable, onAdd, onChange, actions, parentWidth}) => {
	const s = Seq(model.InitialState);
	const add = () => onAdd(new InitialState({ name: Application.defName(model.InitialState, "New Initial State ") }), true);

	return (
		<dl>
			<dt>
				<FormattedMessage id="ModelDashBoard.AnalysisExperimentSettingsView.LabelInitialState" defaultMessage="Initial State"/>
			</dt>
			<Options value={value} none="All Inactive" propertyName="Initial State" options={s.sortBy(e => e.name.toLowerCase())} maxWidth={parentWidth - 98} enabled={onChange && s.size} onChange={onChange} editable={editable} onEdit={actions.onEdit}
				onAdd={add} onRemove={e => actions.onRemove(e, e !== value ? value : undefined)}/>
		</dl>
	);
};