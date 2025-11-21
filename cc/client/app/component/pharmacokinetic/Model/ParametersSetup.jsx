import React, { useEffect, useState } from "react";
import { Seq } from "immutable";
import view from "../../base/view";
import Panel from "../../base/panel";
import Checkbox from "../../base/checkbox";
import Scrollable from "../../base/scrollable";
import Add from "../../../action/add";
import Remove from "../../../action/remove";
import Options from "../../base/options";
import Editable from "../../base/editable";
import ParameterVariability from "../../../entity/pharmacokinetic/ParameterVariability";
import ParameterCovariate from "../../../entity/pharmacokinetic/ParameterCovariate";
import Distribution from "../../../entity/pharmacokinetic/Distribution";
import Function from "../../../entity/pharmacokinetic/Function";
import Update from "../../../action/update";
import Utils from "../../../utils";

export let distribution = [
	{ id: 1, name: "Normal distribution", type: "normal", options: [{ name: "sd", label: "SD", required: true }] },
	{ id: 2, name: "Log-normal distribution", type: "lognormal", options: [{ name: "sd", label: "SD", required: true }] },
	{ id: 3, name: "Logit distribution", type: "logit", options: [{ name: "sd", label: "SD", required: true }, { name: "skewness", label: "Skewness", required: false }, { name: "width", label: "Width", required: false }] },
	{ id: 4, name: "Box-Cox distribution", type: "box_cox", options: [{ name: "sd", label: "SD", required: true }, { name: "skewness", label: "Skewness", required: false }] },
	{ id: 5, name: "Heavy tail distribution", type: "heavy_tail", options: [{ name: "sd", label: "SD", required: true }, { name: "height", label: "Height", required: false }] },
]

let functions = [
	{ id: 1, name: "Allometry  function", type: "allometry", options: [] },
	{ id: 2, name: "Power function", type: "power", options: [{ name: "theta_power", label: "Theta-Power", required: true }] },
	{ id: 3, name: "Linear function ", type: "linear", options: [{ name: "slope", label: "Slope", required: true }, { name: "y_intercept", label: "y-intercept", required: false }] },
	{ id: 4, name: "Exponential function", type: "exponential", options: [{ name: "coefficient", label: "coefficient", required: true }] },
	{ id: 5, name: "Emax function", type: "emax", options: [{ name: "e50", label: "E50", required: true }] },
	{ id: 6, name: "Sigmoid function", type: "sigmoid", options: [{ name: "e50", label: "E50", required: true }, { name: "hill_factor", label: "Hill Factor", required: false }] },
]

let rateIns = [
	{ id: 1, name: "Instantaneous", type: "inst", options: [{ name: "K", label: "K(/hr)", required: true  }] },
	{ id: 2, name: "Zero-order rate", type: "zero", options: [{ name: "K", label: "K(/hr)", required: true  }] },
	{ id: 3, name: "First-order rate", type: "first", options: [{ name: "K", label: "K(/hr)", required: true  }] },
	{ id: 4, name: "Michalis-Menten rate", type: "mm", options: [{ name: "K", label: "K(/hr)", required: true  }] },
]


export function Menus({ optionsObj, label, onEdit, defaultOption = null }) {

	const [selectedOption, setSelectedOption] = useState()
	const [parameterValues, setParameterValues] = useState([])
	const [debounceId, setDebounceId] = useState('');

	useEffect(() => {
		setSelectedOption(defaultOption)
		defaultOption && defaultOption.parameters && setParameterValues(defaultOption.parameters)
	}, [defaultOption])

	const onSelectOption = (e) => {
		setSelectedOption(e)
		const parameters = []
		for (const p of e.options) {
			parameters.push({
				name: p.name,
				label: p.label,
				value: p.required ? 0 : ''
			})
		}
		setParameterValues(parameters);

		const data = {
			name: e.name,
			type: e.type,
			parameters: parameters,
			formula: e.formula || ''
		}

		onEdit(data)

	}

	const dataEmitter = () => {
		const data = {
			name: selectedOption.name,
			type: selectedOption.type,
			parameters: parameterValues,
			formula: selectedOption.formula || ''
		}

		onEdit(data)
	}

	const handleInputChange = (index, value) => {
		const updatedValues = [...parameterValues];
		const atIndex = updatedValues[index]
		atIndex["value"] = value
		updatedValues[index] = atIndex
		setParameterValues(updatedValues);
		dataEmitter()
	};


	return (
		<div>
			<span>{label}: </span>
			<Options
				get="name"
				none={selectedOption && selectedOption.name || ''}
				options={Seq(optionsObj)}
				editable={true}
				onChange={onSelectOption}
			/><br />
			{parameterValues?.map((p, index) => (
				<div key={p.name}>
					<label>{p.label}: </label>
					{/* <Editable 
							value={p.value}
							onEdit={val => handleInputChange(index, val)}
					/> */}

					<input type="number"
						name={p.name}
						value={p.value}
						onChange={e => handleInputChange(index, e.target.value)}
					/>
					<br />
				</div>
			))}
		</div>
	)
}



const covariates = [
	{
		id: '0',
		label: 'Body Weight',
		type: 'body-weight'
	},
	{
		id: '0',
		label: 'Age',
		type: 'age'
	},
	{
		id: '0',
		label: 'Creatinine clearance',
		type: 'creatinine'
	},
	{
		id: '0',
		label: 'Albumin concentration',
		type: 'albumin'
	},
]

const CovariateDisplay = ({ props, actions, parameterCovariates, parameter, type, label, parameterFunctionUpdated, id }) => {

	const onEditCovariate = (e, actions, covariates, parameter, type, name) => {
		let updates = [];
		if (e) {
			updates.push(new Add(
				new ParameterCovariate({
					parameter: parameter,
					type: type,
					name: name,
				})
			));
		} else {
			let covariate;
			if (type === 'custom') {
				covariate = covariates.find(covariate => covariate.id === id)
			} else {
				covariate = covariates.find(covariate => covariate.type === type)
			}
			updates.push(new Remove(covariate))
		}
		actions.batch(updates);
	}

	const covariatesTypeIsSet = (type) => {
		if (!parameterCovariates) return false
		const parameterCovariate = parameterCovariates.find(covariate => covariate.type === type)
		if (parameterCovariate) {
			return true
		}
		return false
	}

	const getDefaultCovariateMenuOptions = (type) => {
		if (!parameterCovariates) {
			return null
		}

		const parameterCovariate = parameterCovariates.find(covariate => covariate.type === type)
		if (!parameterCovariate) return null

		const d = parameterCovariate.function
		if (!d) return null;

		const data = {
			name: d.name,
			type: d.type,
			formula: d.formula,
			parameters: d.parameters,
		}
		return data
	}

	return (
		<div>
			<label style={{ marginLeft: "10px" }}>
				<Checkbox onEdit={e => onEditCovariate(e, actions, parameterCovariates, parameter, type, label)}
					value={covariatesTypeIsSet(type)}
				/>

				{label} : </label>
			{covariatesTypeIsSet(type) && (
				<p style={{ marginLeft: "20px", marginBottom: "10px" }}>
					<Menus {...props}
						onEdit={e => {
							return parameterFunctionUpdated(e, type, props)
						}}
						optionsObj={functions}
						defaultOption={getDefaultCovariateMenuOptions(type)}
						label='Select functions'
					/>
				</p>
			)}

		</div>
	)

}


const AddCustomCovariate = ({ props, onCreate }) => {
	const { model, actions } = props
	const [addCovariate, setAddCovariate] = useState(false)
	const [covariateName, setCovariateName] = useState("")


	const toggleEditing = () => {
		setAddCovariate(!addCovariate)
	}

	const createCustomCovariate = () => {
		const c = {
			type: "custom",
			label: covariateName,
		}
		onCreate(c)
		setAddCovariate(false)
		setCovariateName("")
	}

	return (
		<div style={{ marginTop: "5px", marginLeft: "10px" }}>
			<div>
				{addCovariate ? (
					<div>
						<span><b>Remove custom covariate</b>  </span>
						<input type="button"
							style={{ margin: "0" }}
							className={Utils.css("icon", "base-remove")}
							title="Add custom covariate"
							onClick={toggleEditing} />
					</div>
				) : (
					<div>
						<span> <b>Add custom covariate</b>  </span>
						<input type="button"
							style={{ margin: "0" }}
							className={Utils.css("icon", "base-add")}
							title="Add custom covariate"
							onClick={toggleEditing} />
					</div>
				)
				}

			</div>

			{addCovariate && (
				<>
					<br />
					<input value={covariateName}
						placeholder="Covariate name"
						onChange={e => setCovariateName(e.target.value)}
					/>

					<button onClick={createCustomCovariate}>Save</button>
				</>
			)
			}
		</div>
	)
}


export const ParametersSetupViewBuilder = ({
	onDownload = null,
} = {}) => {
	const Content = props => {
		const { model, modelState, selected: { Parameter: parameter }, actions } = props;

		let parameterVariability = parameter && Seq(model.ParameterVariability).find(variability => `${variability.parameterId}` === `${parameter.id}`);
		let parameterCovariates = parameter && Seq(model.ParameterCovariate).filter(covariate => `${covariate.parameterId}` === `${parameter.id}`)

		let customCovariates = parameterCovariates && parameterCovariates.filter(c => c.type == 'custom')
			.map(c => {
				return { "label": c.name, "type": c.type, "id": c.id }
			}).toArray()



		const refFormUpload = React.useRef(null);

		const [variabilityIsChecked, setVariabilityIsChecked] = useState();
		const [individualIsChecked, setIndividualIsChecked] = useState();
		const [occasionIsChecked, setOccasionIsChecked] = useState();
		const [covatoriesIsChecked, setCovatoriesIsChecked] = useState();
		const [weightIsChecked, setWeightIsChecked] = useState();
		const [ageIsChecked, setAgeIsChecked] = useState();
		const [creatinineIsChecked, setCreatinineIsChecked] = useState();


		const initCovariateList = () => {
			const covariateList = [...covariates];
			if (customCovariates) {
				for (const customCovariate of customCovariates) {
					if (!covariateList.some(c => c.label == customCovariate.label)) {
						covariateList.push(customCovariate)
					}
				}
			}
			return covariateList
		}

		const covariateList = initCovariateList()
		const onSubmit = async (e) => {
			e.preventDefault();
			try {
			} catch (error) {
				actions.showError('Something went wrong: ' + error.message);
			}
		};

		const covariatesIsSet = () => {
			if (!parameterCovariates) return false
			for (let c of covariateList) {
				const parameterCovariate = parameterCovariates.find(covariate => covariate.type === c.type)
				if (parameterCovariate) {
					return true
				}
			}
			return covatoriesIsChecked
		}

		const parameterVariabilityChanged = (e, type, updateVariability = false) => {
			console.log("parameterVariabilityChanged", {e,type})
			let updates = [];

			if (e) {
				if (!parameterVariability) {
					updates.push(new Add(
						new ParameterVariability({
							parameter: parameter,
							type: type,
						})
					));
					setVariabilityIsChecked(true)
				} else {
					parameter  && parameterVariability.distribution ? updates.push(new Remove(parameterVariability.distribution)) && updates.push(new Remove(parameterVariability)) : updates.push(new Remove(parameterVariability));
					updates.push(new Add(
						new ParameterVariability({
							parameter: parameter,
							type: type,
						})
					));

				}
			} else {
				if(parameter && parameterVariability) {
					if(parameterVariability.distribution) {
						updates.push(new Remove(parameterVariability.distribution));
					}
					updates.push(new Remove(parameterVariability));
				}
				setVariabilityIsChecked(false)
			}
			actions.batch(updates);

			if (type === "ind") {
				setIndividualIsChecked(e);
				setOccasionIsChecked(!(e))
			} else if (type === "occ") {
				setOccasionIsChecked(e)
				setIndividualIsChecked(!(e));
			}

			if (updateVariability) {
				setVariabilityIsChecked(e)
			}
		}
		const parameterDistributionUpdated = (e) => {
			let updates = []
			parameter && parameterVariability.distribution && updates.push(new Remove(parameterVariability.distribution));
			const distribution = new Distribution({
				name: e.name,
				type: e.type,
				parameters: e.parameters,
			})

			updates.push(new Add(distribution, true));
			updates.push(new Update(
				parameterVariability, "distribution", distribution
			));
			actions.batch(updates);

		}

		const parameterFunctionUpdated = (e, type) => {
			const parameterCovariate = parameterCovariates.find(covariate => covariate.type === type)
			let updates = []
			const functions = new Function({
				name: e.name,
				type: e.type,
				formula: e.formula,
				parameters: e.parameters
			})
			updates.push(new Add(functions, true))
			updates.push(new Update(
				parameterCovariate, "function", functions
			));

			actions.batch(updates);
		}

		const onEditCovariate = (e, actions, covariates, parameter, type, name) => {
			let updates = [];
			if (e) {
				updates.push(new Add(
					new ParameterCovariate({
						parameter: parameter,
						type: type,
						name: name,
					})
				));
				setCovatoriesIsChecked(true)
			} else {
				const targetCovariate = covariates.find(covariate => covariate.type === type)
				targetCovariate && targetCovariate.function && updates.push(new Remove(targetCovariate.function))
				targetCovariate && updates.push(new Remove(targetCovariate))
				setCovatoriesIsChecked(false)
			}
			actions.batch(updates);
		}

		const updateCovariability = (e, actions, covariates, parameter) => {
			let updates = [];
			if(!e){
				covariates  && covariates.forEach(covariate => {
				covariate.function && updates.push(new Remove(covariate.function)) && updates.push(new Remove(covariate))	
				});
				updates.length && actions.batch(updates)
				weightIsChecked && onEditCovariate(false, actions, covariates, parameter, "body-weight", "Body-weight") && setWeightIsChecked(false)
				ageIsChecked && onEditCovariate(false, actions, covariates,  parameter, "age", "Age") && setAgeIsChecked(false)
				creatinineIsChecked && onEditCovariate(false, actions, covariates, parameter, "creatinine", "Creatinine clearance") && setCreatinineIsChecked(false) 
				setCovatoriesIsChecked(false)
			} else {
				setCovatoriesIsChecked(e)
			}
		}

		const paramaterVariabilityIsSet = () => {
			if (parameterVariability) {
				return true
			}
			return false 
		}

		const paramaterVariabilityTypeSet = (type) => {
			if (!parameterVariability) return false

			if (parameterVariability.type == type) return true

			return false
		}

		const getDefaultVariabilityMenuOptions = () => {
			if (!parameterVariability) {
				return null
			}

			const d = parameterVariability.distribution
			if (!d) return null;

			const data = {
				name: d.name,
				type: d.type,
				parameters: d.parameters,
			}
			return data
		}

		const toggleCovariateIsChecked = (e) => {
			setCovatoriesIsChecked(e)
		}

		const createCustomCovariate = (c, parameter) => {
			const updates = []
			updates.push(new Add(
				new ParameterCovariate({
					parameter: parameter,
					type: c.type,
					name: c.label,
				})
			));
			actions.batch(updates)
		}

		const onTypicalValueEdit = (val) => {
			const parameterK = first(val.parameters) || { name: "K", label: "K(/hr)", value: "1" }
			// console.log("setting param:" {value: Number(parameterK.value), value_type: })
			actions.onEdit(parameter, "value", Number(parameterK.value))
			actions.onEdit(parameter, "value_type", val.type)
		}

		const getDefaultTypicalValue = () => {
			const rateIn = rateIns.find((v) => v.type == parameter.value_type)
			if (!rateIn) {
				return rateIns[0]
			}
			const data = {
				name: rateIn.name,
				type: rateIn.type,
				parameters: [{...rateIn.options[0], value: parameter.value}],
			}
			return data
		}

		return (
			<Panel {...props.view} className="analysis3-phase1 analysis2-phase2 upload-files">
				<Scrollable>
					<div className="upload-drug-files">
						<form onSubmit={onSubmit} ref={refFormUpload}>
							<div>
								<Checkbox value={true} />
								Typical value(L/hr) :
								{parameter && parameter.type === 'K' ?
									<p style={{ marginLeft: "20px", marginBottom: "10px" }}>
										<Menus {...props}
											onEdit={onTypicalValueEdit}
											optionsObj={rateIns}
											label='Select rate in'
											defaultOption={parameter && getDefaultTypicalValue()}
										/>
									</p>
									:
									<Editable className="typicalValue"
										value={parameter && parameter.value}
										onEdit={val => actions.onEdit(parameter, "value", val)}
									/>
								}

								<div style={{ marginTop: "5px" }}>
									<Checkbox onEdit={(e) => parameterVariabilityChanged(e, "ind", true)} value={paramaterVariabilityIsSet()} />
									<label>Variability : </label>

									{paramaterVariabilityIsSet() && (
										<div style={{ marginTop: "5px" }}>
											<label style={{ marginLeft: "10px" }}>
												<Checkbox onEdit={(e) => parameterVariabilityChanged(e, "ind")} value={paramaterVariabilityTypeSet("ind")} />
												Inter-individual variability :
											</label>

											{paramaterVariabilityTypeSet("ind") && (
												<p style={{ marginLeft: "20px", marginBottom: "10px" }}>
													<Menus {...props}
														onEdit={e => parameterDistributionUpdated(e, props)}
														optionsObj={distribution}
														label='Select distribution'
														defaultOption={getDefaultVariabilityMenuOptions()}
													/>
												</p>
											)}
											<div>
												<label style={{ marginLeft: "10px" }}>
													<Checkbox onEdit={(e) => parameterVariabilityChanged(e, "occ")} value={paramaterVariabilityTypeSet("occ")} />
													Inter-occasion variability
												</label>
												{paramaterVariabilityTypeSet("occ") && (
													<p style={{ marginLeft: "20px", marginBottom: "10px" }}>
														<Menus {...props}
															optionsObj={distribution}
															onEdit={e => parameterDistributionUpdated(e, props)}
															label='Select distribution'
															defaultOption={getDefaultVariabilityMenuOptions()}
														/>
													</p>
												)}
											</div>
										</div>
									)}
								</div>

								<div style={{ marginTop: "5px" }}>
									<label>
										<Checkbox onEdit={(e) => updateCovariability(e, actions, parameterCovariates, parameter)} value={covatoriesIsChecked || covariatesIsSet()} />
										{/* <Checkbox onEdit={v => toggleCovariateIsChecked(v)} value={covatoriesIsChecked || covariatesIsSet()} /> */}
										Covariates:
									</label>

									{covariatesIsSet() && (
										<div>
											{covariateList.map(c => (
												<CovariateDisplay
													key={c.type}
													props={props}
													actions={actions}
													parameterCovariates={parameterCovariates}
													parameter={parameter}
													type={c.type}
													label={c.label}
													id={c.id}
													parameterFunctionUpdated={parameterFunctionUpdated}
												/>
											))}

											<AddCustomCovariate
												props={props}
												onCreate={(data) => createCustomCovariate(data, parameter)}
											/>
										</div>
									)}
								</div>



							</div>
						</form>
					</div>
				</Scrollable>
			</Panel>
		);
	};

	const Actions = props => {
		return {
		};
	};

	return view(Content, null, Actions);
}

export default ParametersSetupViewBuilder()
