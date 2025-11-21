import React, {useState} from "react";
import { Seq } from 'immutable';


import { isDevFeatureEnabled, allDevFeatures, setNewDevFeatures } from "../../development/devFeatures";

const DevFeatures  = () => {
	const getDefaultFeatureObject = () => Seq(allDevFeatures).toMap().mapEntries(([_, keyName]) => { return [keyName, isDevFeatureEnabled(keyName)]}).toObject();
	const [enabledFeatures, changeFeatures] = useState(getDefaultFeatureObject());

	const showOrHideDevFeature = (featureName, isEnabled) => {
		changeFeatures({
			...enabledFeatures,
			[featureName]: isEnabled
		});
	}

	const resetFromStore = () => {
		changeFeatures(getDefaultFeatureObject());
	}
	const applyChanges = () => {
		setNewDevFeatures(enabledFeatures);
		window.location.reload(true);
	}

	return (
		<div>
			<h1 id='title'>Enable Dev Features</h1>
			<table id='students'>
				<tbody>
					{Seq(enabledFeatures).map((isEnabled, featureName) => {
						return (
							<tr key={featureName}>
								<td>{featureName}</td>
								<td><input type='checkbox' checked={isEnabled} onClick={() => showOrHideDevFeature(featureName, !isEnabled)} /></td>
							</tr>
						);
					})}
					<tr key='submit'>
						<td colSpan="2"><input type='button' value='reset' onClick={resetFromStore} />&nbsp;<input type='button' value='apply'  onClick={applyChanges} /></td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}

export default DevFeatures;