import React from "react";
import { Seq } from "immutable";
import Application from "../../../../../application";
import view from "../../../../base/view";
import Panel from "../../../../base/panel";
import Checkbox from "../../../../base/checkbox";
import Editable from "../../../../base/editable";
import Options from "../../../../base/options";
import SliderInput from "../../../../base/sliderInput";
import Scrollable from "../../../../base/scrollable";
import Utils from "../../../../../utils";
import { rSelectDataContent } from "./SelectData";
import "./style.scss";

const BasicDropdown = (props) => {
	const [value, setValue] = React.useState(false);
	if (props.disabled && value) {
		setValue(false);
	}

	const handleClick = (e) => {
		const collapsedPath = ['contextSpecificFastCore', 'settings', 'collapse'];
		props.actions.onEditModelState(collapsedPath, (new Date()).getTime());
		setValue(!value);
	}

	const visible = value || props.defaultValue;
	const classes = "icon base-menu" + (visible ? " dropdown-icon-open" : " dropdown-icon-closed");
	return (
		<div className={props.className}>
			<div className="header">
				{props.header}
				<span style={{ width: 16 }} className={classes} onClick={handleClick}></span>
			</div>
			{visible && <div className="dropdown-content">
				{props.children}
			</div>}
		</div>
	)
}


const SelectDataSection = (props) => {
	const { optionsList, data } = props;
	props.optionsList.map(opt => {
		let val = data[opt.id] && data[opt.id].value;
		opt.checked = val ? true : false;
	})
	return (<div>
		<div className="underline">Select Data Types</div>
		<dl className="checkboxes">
			{optionsList.map(opt => {
				let val = data[opt.id] && data[opt.id].value;
				let cssClass = Utils.css(val ? 'checked' : '', (data[opt.id] && data[opt.id].checkable === false) && 'disabled');

				const isEditable = val ? true : false;
				const updatedProps = { ...props, editable: isEditable }

				let styles = {
					fontWeight: val ? 'bold' : 'normal',
					opacity: opt.id === 'data_merging' && !val ? 0.5 : 1
				}
				const disabled = opt.id === 'data_merging' ? !val : false;
				return (
					<BasicDropdown
						{...props}
						key={opt.id}
						className={cssClass}
						disabled={disabled}
						header={
							<>
								<Checkbox value={val} onEdit={opt.onEdit} />
								<span className="option" style={styles}>{opt.name}</span>
							</>
						}>
						{rSelectDataContent(opt.id, updatedProps)}
					</BasicDropdown>
				)
			}
			)}
		</dl>
	</div>)
}

export const ModelCreationSettingsViewBuilder = () => {

	const Content = (props) => {

		const { view, model, modelState, actions, parentHeight } = props;

		const settingsPath = ['contextSpecificFastCore', 'settings'];
		const speciesTaxonId = modelState.getIn(settingsPath.concat(['speciesTaxonId']));
		const checkboxesData = modelState.getIn(settingsPath.concat(['checkboxesData']));

		const layoutData = Seq([
			{ id: 'single-end', name: 'Single End' },
			{ id: 'paired-end', name: 'Paired End' },
		]);
		const methodData = Seq([
			{ id: 'zfpkm', name: 'zFPKM' },
			{ id: 'quantile', name: 'Quantile' },
			{ id: 'cpm', name: 'Counts per Million' }
		]);
		const mergingMethodData = Seq([
			{ id: 'regressive', name: "Regressive" },
			{ id: 'progressive', name: "Progressive" },
			{ id: 'flat', name: "Flat" },
		]);

		const handleEditSpeciesTaxonId = (val) => {
			if (isNaN(val) === true) {
				actions.onShowMessageOnAction(`The entered ${val} is not a valid Taxon ID. For example, 9606 is used for human.`);
				return;
			}
			cc.request.get(`/api/ncbi/taxonomy/${val}`, {
				headers: { "Content-Type": "application/json" }
			}).then(resp => {
				actions.onEditModelState(settingsPath.concat(['speciesTaxonId']), parseInt(val));
			}).catch(err => {
				actions.onShowMessageOnAction(`The ID ${val} does not exist in the NCBI database.`);
			});
		}

		const handleCheckbox = (type, val) => {
			const checkboxes = { ...checkboxesData };
			checkboxes[type] = { value: val };

			const count = Seq(checkboxes).filter((v, k) => k !== 'data_merging' && v.value).count();
			checkboxes.data_merging = { value: (count > 1) };

			actions.onEditModelState(settingsPath.concat(['checkboxesData']), checkboxes);
		}

		const checkboxesList = [
			//{id: 'microarray', name: 'Microarray', onEdit: handleCheckbox.bind(null, 'microarray')},
			{ id: 'bulk_rna', name: 'Bulk Total RNA Sequencing', onEdit: handleCheckbox.bind(null, 'bulk_rna') },
			{ id: 'bulk_polya_rna', name: 'Bulk PolyA RNA Sequencing', onEdit: handleCheckbox.bind(null, 'bulk_polya_rna') },
			{ id: 'bulk_cell_rna', name: 'Single Cell RNA Sequencing (Pre Normalized)', onEdit: handleCheckbox.bind(null, 'bulk_cell_rna') },
			{ id: 'proteomics', name: 'Proteomics (Pre Normalized)', onEdit: handleCheckbox.bind(null, 'proteomics') },
			{ id: 'data_merging', name: 'Data Merging Settings', onEdit: undefined }
		]

		return (
			<Panel {...view} className="bar analysis1-phase1 panel-model-creation-settings">

				<div>
					<dl>
						<dt className="text-input">
							<dd>Species/Taxon ID:</dd>
							<Editable
								name="SpeciesTaxonId"
								placeHolder='Enter Species/Taxon ID'
								value={speciesTaxonId}
								onEdit={handleEditSpeciesTaxonId}
								className={speciesTaxonId === null ? "editablePlaceholder" : "valuePlaceholder" }
							/>
						</dt>
					</dl>
				</div>
				<Scrollable>
					<SelectDataSection
						data={checkboxesData}
						optionsList={checkboxesList}
						optionsLayout={layoutData}
						optionsMethod={methodData}
						optionsMergingMethod={mergingMethodData}
						actions={actions}
						state={modelState}
					/>
				</Scrollable>
			</Panel>
		)
	}

	const Actions = (props) => {
		const { model, modelState, selected: { Experiment: e, Environment: environment }, actions } = props;

		return {};
	};

	return view(Content, null, Actions);
}

export default ModelCreationSettingsViewBuilder();