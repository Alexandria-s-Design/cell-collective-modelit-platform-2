import React, { useState } from "react";
import view from "../../../base/view";
import Checkbox from "../../../base/checkbox";
import Scrollable from '../../../base/scrollable';
import Editable from "../../../base/editable";

const Content = (props) => {
	
	// let initialThresholds = props.modelState.getIn(["AdvancedGraphPanel", "DefaultThreshold"]) || false
	// Fetch from model state for sharing between other compartments
	let initialThresholds = [
		{
			'label': 'MIC',
			'value': 0,
			'type': 'Efficacy',
			'selected': false,
			'default': true
		},
		{
			'label': 'TOX',
			'value': 0,
			'type': 'Toxicity',
			'selected': false,
			'default': true
		},
	]

	if (props.thresholds && props.thresholds.length > 0) {
		initialThresholds =  props.thresholds
	}
	
	const logYScaleValue = props.modelState.getIn([props.panelName, "UseLogForYAxis"]) || false

	const [thresholds, setThresholds] = useState(initialThresholds)
	const [ logYscale, setLogYscale] = useState(logYScaleValue)

	const labelStyle = {
		fontSize: '12px',
		fontWeight: '900',
		color: 'black',
		marginRight: '2px'
	}

	const handleInputChange = (keyName, value, label) => {
		const updatedThresholds = thresholds.map(t => t.label === label ? { ...t, [keyName]: value } : t)
		setThresholds(updatedThresholds)
		const profileThresholds = updatedThresholds.filter(t => t.selected === true);
		props.actions.onEditModelState([props.panelName, "threshold"], profileThresholds)
	};

	const toggleThreshold = (value, label) => {
		const thresholdToUpdate = thresholds.find(t => t.label === label)
		let updatedThresholds;
		if (thresholdToUpdate && !thresholdToUpdate.default) {
			updatedThresholds = thresholds.filter(t => t.label !== label);
		} else {
			updatedThresholds = thresholds.map(t => t.label === label ? { ...t, selected: value } : t)
		}
		setThresholds(updatedThresholds)
		const profileThresholds = updatedThresholds.filter(t => t.selected === true);
		props.actions.onEditModelState([props.panelName, "threshold"], profileThresholds)
	}

	const createNewThreshold = () => {
		const newThreshold = { label: `LABEL_PLACEHOLDER${thresholds.length + 1}`, value: 0, type: 'TYPE_PLACEHOLDER', selected: true, 'default': false }
		setThresholds([...thresholds, newThreshold])
	}

	const setLogYScaleValue =(value) => {
		setLogYscale(value)
		props.actions.onEditModelState([props.panelName, "UseLogForYAxis"], value)
	}

	return (
		<div className="graph-advanced">
			<Scrollable >
				<div className="content">
					<div style={{ marginBottom: "10px" }} >
						<label>
								<Checkbox
										value={logYscale}
										onEdit={(e) => {
											setLogYScaleValue(e)
										}}
									/>
									<span style={labelStyle}> Log y scale </span>
									
						</label>
					</div>

					<ul>
						{thresholds.map((threshold) => (
							<li style={{ marginBottom: "10px" }} key={threshold.label}>
								<label>
									<Checkbox
										value={threshold.selected}
										onEdit={(e) => {
											toggleThreshold(e, threshold.label)
										}}
									/>
									<span style={labelStyle}>Add threshold </span>
								</label>
								<div style={{ marginLeft: "18px" }}>
									Label: <strong>
										<Editable
											value={threshold.label}
											preventDefault={props.preventDefault}
											onEdit={(v) => handleInputChange('label', v, threshold.label)}
										/>
									</strong>
									<br />
									Value:
									<strong>
										<Editable
											value={Number(threshold.value)}
											preventDefault={props.preventDefault}
											onEdit={(v) => handleInputChange('value', Number(v), threshold.label)}
										/>

									</strong>
									<br />
									Type: <strong>
										<Editable
											value={threshold.type}
											preventDefault={props.preventDefault}
											onEdit={(v) => handleInputChange('type', v, threshold.label)}
										/>
									</strong>
									<br />
								</div>

							</li>
						))}
					</ul>
					<input type='button'
						className={"icon base-add"}
						onClick={() => createNewThreshold()}
					/> <span> <strong> Create Custom Threshold </strong> </span>
				</div>
			</Scrollable>
		</div>
	);

}

const e = view(Content);
e.width = 800;
e.height = 350;

export const MessageContent = Content;
export default e;