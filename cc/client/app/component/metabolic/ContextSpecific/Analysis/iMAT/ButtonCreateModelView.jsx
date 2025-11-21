import React from "react";
import { Seq } from "immutable";
//import Application from "../../../../../application";
import view from "../../../../base/view";
//import Panel from "../../../../base/panel";
import cc from '../../../../../cc';
import { ContextType } from "../../../../../entity/metabolic/ContextSpecific/BoundaryReaction";
import "./style.scss";
import showMessage, { TYPE_ERROR, TYPE_SUCCESS } from "../../../../../message";

const showToast = (type, msg) => {
  showMessage({
    message: msg,
    type: type,
    options: {
      extendedTimeOut: 30000,
      timeOut: 60000,
			preventDuplicates: true,
    },
  });
};

const verifyGenesMatrixUpload = (analysisType, jsonBody) => {
	let hasFile = false;	
	switch (analysisType) {
		case "bulk_rna":
				hasFile	= jsonBody.typeBulkTotalRNA.upload;
				break;
		case "bulk_polya_rna":
				hasFile	= jsonBody.typeBulkPolyaRNA.upload;
				break;
		case "bulk_cell_rna":
				hasFile	= jsonBody.typeSingleCellRNA.upload;
				break;
		case "proteomics":
				hasFile	= jsonBody.typeProteomics.upload;
				break;
		default: break;
	}
	return hasFile;	
}

export const ButtonCreateModelViewBuilder = () => {

	const Content = (props) => {
		const {view, model, modelState: state, persisted, entities, selected, actions} = props;

		const [contextStatus, setContextStatus] = React.useState({creating: false});
		const contextSpecificPath = ['contextSpecificiMAT'];
		
		const handleCreateModel = () => {

			if (Seq(model.Reaction).isEmpty()) {
				showToast(TYPE_ERROR, `Please add reactions to this model and save it before continuing.`);
				return;
			}

			setContextStatus(pv => ({...pv, creating: true}))
			let analysisType = null;
			const jsonBody = state.getIn(contextSpecificPath).map(m => {
				return m && m.toObject();
			}).filter(m => m).toObject();

			if (jsonBody.settings.checkboxesData) {
				Seq(jsonBody.settings.checkboxesData)
					.filter((v, k) => (k !== 'data_merging') && ('value' in v) && (v.value == true))
					.forEach((_, k) => {
						analysisType = k;
					});
			}

			if (jsonBody.settings.objectiveFunction) {
				let objectiveKey = jsonBody.settings.objectiveFunction;
				let eName = model.ObjectiveFunction[objectiveKey];
				jsonBody.settings.objectiveFunction = eName && eName.name || null;
			}
			
			if (jsonBody.typeBulkTotalRNA.method) {
				if (typeof jsonBody.typeBulkTotalRNA.method == 'object') {
					jsonBody.typeBulkTotalRNA.method = jsonBody.typeBulkTotalRNA.method.id;
				}
			}
			if (jsonBody.typeBulkPolyaRNA.method) {
				if (typeof jsonBody.typeBulkPolyaRNA.method == 'object') {
					jsonBody.typeBulkPolyaRNA.method = jsonBody.typeBulkPolyaRNA.method.id;
				}	
			}

			jsonBody.contextType = ContextType.iMAT;
			jsonBody.analysisType = analysisType;	
			
			if (!analysisType) {
				showToast(TYPE_ERROR, `Please select at least one option under "Select Data Type."`);
				return setContextStatus(pv => ({...pv, creating: false}))
			}

			let verifyGenesUpload = verifyGenesMatrixUpload(analysisType, jsonBody)

			if (!verifyGenesUpload) {
				showToast(TYPE_ERROR, `Please choose a file under "Select Data Type."`);
				return setContextStatus(pv => ({...pv, creating: false}))
			}

			if (Seq(model.BoundaryReaction).isEmpty()) {
				showToast(TYPE_ERROR, `Please choose a Boundary Reactions file`);
				return setContextStatus(pv => ({...pv, creating: false}))
			}

			jsonBody.boundaryReactions.data = Seq(model.BoundaryReaction)
				.filter(m => m.contextType == ContextType.iMAT)
				.toArray().map(m => m.self);

			jsonBody.coreForceReactions.data = Seq(model.CoreReaction)
				.filter(m => m.contextType == ContextType.iMAT)
				.toArray().map(m => m.self);

			jsonBody.excludeReactions.data = Seq(model.ExcludeReaction)
				.filter(m => m.contextType == ContextType.iMAT)
				.toArray().map(m => m.self);

			const formData = new FormData();
			let analysisUploads = [];
			if (jsonBody) {
				Object.keys(jsonBody).forEach(inputName => {
					if (jsonBody[inputName].upload) {
						analysisUploads.push(inputName);
						formData.append(`upload:${inputName}`, jsonBody[inputName].upload.objectFile)
						jsonBody[inputName].upload = null;
					}
					formData.append(inputName, JSON.stringify(jsonBody[inputName]))
				});
			}

			const taxonId = jsonBody.settings.speciesTaxonId;
			if(!taxonId) {
				showToast(TYPE_ERROR, `Please enter a species id.`);
        return setContextStatus(pv => ({...pv, creating: false}))
			}	

			if(model.top.Persisted <= 0) {
				showToast(TYPE_ERROR, `Please save the model first.`);
				return setContextStatus(pv => ({...pv, creating: false}))
			}

			if (!analysisUploads.length) {
				showToast(TYPE_ERROR, `Please select a file to upload.`);
				return setContextStatus(pv => ({...pv, creating: false}))
			}
			
			cc.request.post(`/api/model/${model.top.Persisted}/context`, formData, {
				headers: {"Content-Type": "multipart/form-data"	}
			}).then(resp => {
				// Message should be from API
				// showToast(TYPE_SUCCESS, `Your Context Specific model is being created.
				// 	We will notify you once it\'s available in your account.`);
			}).catch(err => {
				setContextStatus(pv => ({...pv, creating: false}))
				showToast(TYPE_ERROR, `There seems to be an issue with creating the Context Specific. Error: ${err.message}`);
			});
		}

		return <div className="panel-button-create-model">
			<button
				type="button"
				onClick={handleCreateModel}
				disabled={contextStatus.creating ? 'disabled': null}
			>{contextStatus.creating ? 'Processing...' : 'Create Model'}</button>
		</div>
	}
	
	return view(Content, false);
}

export default ButtonCreateModelViewBuilder();