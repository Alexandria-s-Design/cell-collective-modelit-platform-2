
import { Seq } from "immutable";

/**
 * Initializes the experiment environment setup with the provided model, modelState, and actions.
 * @param {Object} params - The parameters for setting up the environment.
 * @param {Object} params.model - The model for the experiment environment.
 * @param {Object} params.modelState - The state of the model.
 * @param {Object} params.actions - The actions that can be performed on the model.
 * @returns {Object} The initialized setup object.
 */
function experEnvironmentSetup({model, modelState, actions}) {
	return {
			Model: model,
			ModelState: modelState,
			actions
	};
}

/**
 * Selects the first environment from the experiment setup and updates the application state.
 * @param {experEnvironmentSetup} setup - The experiment environment setup.
 * @returns {string|null} - The ID of the first environment, or null if no environment exists.
 */
export function doSelectDefaultEnvironment(setup = experEnvironmentSetup(), first) {
	try {
			let defaultEnv = Seq(setup.Model.Environment).toMap().filter(e => e.isDefault).first();
			if (first && defaultEnv) {
				defaultEnv = Seq(setup.Model.Environment).toMap().filter(e => !e.isDefault).first();
			}
			if (defaultEnv) {
					let selectedElement = setup.ModelState.getIn(["selected"]);
					selectedElement = selectedElement.merge({'Environment': defaultEnv.id});
					setup.actions.onEditModelState(["selected"], selectedElement);
					return defaultEnv;
			}
			return null;
			
	} catch (error) {
			console.error("Error selecting experiment environment:", error);
			return null;
	}
}

export default experEnvironmentSetup