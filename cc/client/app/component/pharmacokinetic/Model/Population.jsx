import React, { useState } from "react";
import { Seq } from "immutable";
import view from "../../base/view";
import Panel from "../../base/panel";
import Checkbox from "../../base/checkbox";
import Scrollable from "../../base/scrollable";
import Add from "../../../action/add";
import Population from "../../../entity/pharmacokinetic/Population";
import Distribution from "../../../entity/pharmacokinetic/Distribution";
import Remove from "../../../action/remove";
import Update from "../../../action/update";
import { Menus,} from "./ParametersSetup";


const download = [
	{ id: "CSV", name: "CSV" },
	{ id: "Excel", name: "Excel" }
];

const distribution = [
	{ id: 11, name: "Normal distribution", type: "normal", options: [{ name: "sd", label: "SD", required: true }, { name: "mean", label: "Mean", required: true }] },
	{ id: 12, name: "Log-normal distribution", type: "lognormal", options: [{ name: "sd", label: "SD", required: true }, { name: "mean", label: "Mean", required: true }] },
	{ id: 13, name: "Uniform", type: "uniform", options: [{ name: "min", label: "Min", required: true }, { name: "max", label: "Max", required: true }] },
]


const PopulationVariableDisplay = ({props, type, label, onDistChange, onEditPopulation, getDistMenuOption}) => {
	const population = Seq(props.model.Population).find(p => p.type === type);

	// if not exists create it
	if(!population) {
		onEditPopulation(true, label, type, "normal", { median: 0, sd: 0 })
	} 
	
	return (
		<div style={{ marginTop: "15px" }}>
			<label style={{ marginLeft: "10px" }}>
				<Checkbox onEdit={e => {
					onEditPopulation(e, label, type, "normal", { median: 0, sd: 0 })
				}} value={population} />
				{label} : </label>
			
			{population && (
				<p style={{ marginLeft: "15px" }}>
					<Menus {...props}
						onEdit={e => onDistChange(e, type)}
						optionsObj={distribution}
						label='Select distribution'
						defaultOption={getDistMenuOption(type)}
					/>
		  	</p>
			) }
			
		</div>
	)
}


export const PopulationViewBuilder = ({
	onDownload = null,
} = {}) => {
	const Content = props => {
		const { model, selected: { Parameter: parameter }} = props;
		const actions = props.actions;
		const refFormUpload = React.useRef(null);
		// check if we already have populations for default covariates
		let bwPopulation = Seq(model.Population).find(p => p.type === "body-weight");
		let agePopulation = Seq(model.Population).find(p => p.type === "age");
		let creatininePopulation = Seq(model.Population).find(p => p.type === "creatinine");
		let albuminPopulation = Seq(model.Population).find(p => p.type === "albumin");
		let customPopulations = Seq(model.Population).filter(p => p.type === "custom");

		Seq(model.ParameterCovariate).forEach(covariate => {
			switch(covariate.type) {
				case 'age': !agePopulation && actions.onAdd(new Population({name: "Age", type: covariate.type})); break;
				case 'albumin': !albuminPopulation && actions.onAdd(new Population({name: "Albumin concentration", type: covariate.type})); break;
				case 'creatinine': !creatininePopulation && actions.onAdd(new Population({name: "Creatinine concentration", type: covariate.type})); break;
				case 'body-weight': !bwPopulation && actions.onAdd(new Population({name: "Body Weight", type: covariate.type})); break;
				case 'custom':
					const customPopulation = customPopulations.find(p => p.name === covariate.name);
					if (!customPopulation) {
						actions.onAdd(new Population({name: covariate.name, type: covariate.type}));
					}
					break;
				default:;
			}
		});

		const onEditPopulation = (e, name, type, dist, distParams) => {
			let updates = [];
			let population = Seq(model.Population).find(p => p.type === type);

			if (e) {
				updates.push(new Add(
					new Population({
						name: name,
						type: type,
					})
				));
			} else {
				population.distribution && updates.push(new Remove(population.distribution));
				updates.push(new Remove(population))
			}
			actions.batch(updates);
		}

		const onDistChange = (e, population) => {
			let distributionEntity = new Distribution({
				name: e.name,
				type: e.type,
				parameters: e.parameters,
			})

			let updates = [];
			updates.push(new Add(distributionEntity, true));

			if (population) {
				updates.push(new Update(
					population, "distribution", distributionEntity
				));				
			} else {
				population = Seq(model.ParameterCovariate).find(p => p.type === type);
				updates.push(new Add(
					new Population({
						name: population.name,
						type: population.type,
					})
				));
			}			
			actions.batch(updates);
		}

		const shouldBeSimPopChecked = () => {
			return bwPopulation || agePopulation || albuminPopulation || customPopulations.size > 0;
		}

		const onSelectOption = (name, _, e) => {
			const opts = { ...distributionFormFields };
			opts[name] = e ? e : "";
			// setDistributionFormFields(opts);
		}

		const onSelectDownloadOption = (name, _, e) => {
			const opts = { ...distributionFormFields };
			opts[name] = e ? e : "";
			setDownloadFormFields(opts);
		}

		const onSubmit = async (e) => {
			e.preventDefault();

			try {
			} catch (error) {
				actions.showError('Something went wrong: ' + error.message);
			}

		};


		const getDistMenuOption = (population) => {
			if (!population) return null
			const d = population.distribution
			if (!d) return null

			const data = {
				name: d.name,
				type: d.type,
				parameters: d.parameters,
			}
			return data
		}

		return (
			<Panel {...props.view} className="analysis3-phase1 analysis2-phase2 upload-files">
				<Scrollable>
					<div className="upload-drug-files">
						<form onSubmit={onSubmit} ref={refFormUpload}>
							<div>
								<span>
									<input type="radio" name="population" checked={shouldBeSimPopChecked()}/>
									Simulation population
								</span>
								<div style={{ marginTop: "5px" }}>
									<label style={{ marginLeft: "10px" }}>
										<Checkbox onEdit={e => {
											onEditPopulation(e, "Body Weight", "body-weight", "normal", { median: 0, sd: 0 })
										}} value={bwPopulation} />
										Body Weight: </label>
									
									{ bwPopulation && (<p style={{ marginLeft: "15px" }}>
										<Menus {...props}
											onEdit={e => onDistChange(e, bwPopulation)}
											optionsObj={distribution}
											label='Select distribution' 
											defaultOption={getDistMenuOption(bwPopulation)}
											/>
									</p>)}
								</div>
								<div style={{ marginTop: "15px" }}>
									<label style={{ marginLeft: "10px" }}>
										<Checkbox onEdit={e => {
											onEditPopulation(e, "Age", "age", "normal", { median: 0, sd: 0 })
										}} value={agePopulation} />
										Age: </label>
									
									{agePopulation && (<p style={{ marginLeft: "15px" }}>
										<Menus {...props}
											onEdit={e => onDistChange(e, agePopulation)}
											optionsObj={distribution}
											label='Select distribution'
											defaultOption={getDistMenuOption(agePopulation)}
											/>
									</p>)}
								</div>
								<div style={{ marginTop: "15px" }}>
									<label style={{ marginLeft: "10px" }}>
										<Checkbox onEdit={e => {
											onEditPopulation(e, "Creatinine concentration", "creatinine", "normal", { median: 0, sd: 0 })
										}} value={creatininePopulation} />
										Creatinine concentration: </label>

									{creatininePopulation && (<p style={{ marginLeft: "15px" }}>
										<Menus {...props}
											onEdit={e => onDistChange(e, creatininePopulation)}
											optionsObj={distribution}
											label='Select distribution' 
											defaultOption={getDistMenuOption(creatininePopulation)}
											/>
									</p>)}
								</div>
								<div style={{ marginTop: "15px" }}>
									<label style={{ marginLeft: "10px" }}>
										<Checkbox onEdit={e => {
											onEditPopulation(e, "Albumin concentration", "albumin", "normal", { median: 0, sd: 0 })
										}} value={albuminPopulation} />
										Albumin concentration: </label>

									{albuminPopulation && (<p style={{ marginLeft: "15px" }}>
										<Menus {...props}
											onEdit={e => onDistChange(e, albuminPopulation)}
											optionsObj={distribution}
											label='Select distribution' 
											defaultOption={getDistMenuOption(albuminPopulation)}
											/>
									</p>)}
								</div>
								{
									customPopulations.toArray().map((p, _) => 
										<div style={{ marginTop: "15px" }}>
											<label style={{ marginLeft: "10px" }}>
												<Checkbox value={p} /> {p.name}
											</label>

											<p style={{ marginLeft: "15px" }}>
												<Menus {...props}
													onEdit={e => onDistChange(e, p)}
													optionsObj={distribution}
													label='Select distribution' 
													defaultOption={getDistMenuOption(p)}
													/>
											</p>
										</div>
									)
								}
								<span>
									{/* <Checkbox onEdit={setDownloadlIsChecked} value={downloadlIsChecked} /> */}
									<input type="radio" name="population" disabled />
									Dowload pre-defined population:
								</span>
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

export default PopulationViewBuilder()
