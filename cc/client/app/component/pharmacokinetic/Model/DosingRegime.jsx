import React, { useState } from "react";
import { Seq } from "immutable";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Scrollable from "../../base/scrollable";
import Add from "../../../action/add";
import Update from "../../../action/update";
import Options from "../../base/options";
import DosingRegimen from "../../../entity/pharmacokinetic/DosingRegimen";


const dosignRoutes = [
	{ name: "Oral Dose" }, { name: "Intravenous" }
]
const dosignRoutesMap = { 
	"Oral Dose": "od",
	"Intravenous": "iv"
}

// const multipleDoseRoutes = [
// 	{ name: "Oral Dose" }, { name: "Intravenous" }
// ]

export const DosingRegimeViewBuilder = ({
	onDownload = null,
} = {}) => {
	const Content = props => {
		const { view, model, modelState, persisted, entities, selected: { Parameter: parameter }, actions } = props;

		let dosingRegimen = parameter && Seq(model.DosingRegimen).find(dr => `${dr.parameterId}` === `${parameter.id}`)
		const state = modelState.get("DrugScore");
		const selection = modelState.getIn(["selection", "DrugScore"]);

		const refFormUpload = React.useRef(null);

		const onValueChange = (e) => {
			if (dosingRegimen) {
				const updates = []
				updates.push(new Update(dosingRegimen, 'type', e.target.value));
				actions.batch(updates);
			} else {
				createDosignRegiment(e.target.value)
				dosingRegimen = parameter && Seq(model.DosingRegimen).find(dr => `${dr.parameterId}` === `${parameter.id}`)
			}

		}

		const createDosignRegiment = (type) => {
			const regiment = new DosingRegimen({
				parameter: parameter,
				type: type
			})

			const updates = []
			updates.push(new Add(regiment, true))
			actions.batch(updates);
		}

		const onDosignRegimenValueChange = (v, p) => {
			const updates = []
			updates.push(new Update(dosingRegimen, p, v));
			actions.batch(updates);
		}

		// show or hide table on click
		const [showTable, setShowTable] = React.useState(false);

		const onSubmit = async (e) => {
			e.preventDefault();

			try {
			} catch (error) {
				actions.showError('Something went wrong: ' + error.message);
			}

		};

		return (
			<Panel {...props.view} className="analysis3-phase1 analysis2-phase2 upload-files">
				<Scrollable>
					<form onSubmit={onSubmit} ref={refFormUpload}>
						<div>
							<div style={{ marginTop: "5px" }}>
								<label style={{ marginLeft: "10px" }}>
									<input type="radio" name="dose" value="single"
										onChange={onValueChange}
										checked={dosingRegimen && dosingRegimen.type === 'single'} />
									Single dose(mg) </label>
								{(dosingRegimen && dosingRegimen.type === 'single') && (<div style={{ marginLeft: "25px" }}>
									<span style={{ marginLeft: "1em" }}>Route:</span>
									<Options
										get="name"
										none={dosingRegimen && dosingRegimen.route || ''}
										options={Seq(dosignRoutes)}
										editable={true}
										onChange={e => onDosignRegimenValueChange(dosignRoutesMap[e.name], "route")}
									/><br />
									<label style={{ marginLeft: "1em" }}>Amount (mg): </label>
									<input type="text" name="amount"
										value={dosingRegimen && dosingRegimen.amount || ''}
										onChange={e => onDosignRegimenValueChange(e.target.value, "amount")} />
									<br />

									{
											(dosingRegimen && dosingRegimen.route === 'Intravenous') && (
												<div>
													<label style={{ marginLeft: "1em" }}>Infusion Duration(hr): </label>
													<input type="text" name="amount"
														value={dosingRegimen && dosingRegimen.duration || ''}
														onChange={e => onDosignRegimenValueChange(e.target.value, "duration")} />
													<br />
												</div>
											)
										}

								</div>)}
							</div>
							<div style={{ marginTop: "15px" }}>
								<label style={{ marginLeft: "10px" }}>
									<input type="radio" name="dose" value="multiple"
										onChange={onValueChange}
										checked={dosingRegimen && dosingRegimen.type === 'multiple'}
									/>
									Multiple dose(mg) </label>
								{(dosingRegimen && dosingRegimen.type === 'multiple') && (

									<p style={{ marginLeft: "25px" }}>
										<span style={{ marginLeft: "1em" }}>Route:</span>
										<Options
											none={dosingRegimen && dosingRegimen.route || ''}
											options={Seq(dosignRoutes)}
											editable={true}
											onChange={e => onDosignRegimenValueChange(dosignRoutesMap[e.name], "route")}
										/>
										<br />

										<label style={{ marginLeft: "1em" }}>Amount (mg): </label>
										<input type="text" name="amount"
											value={dosingRegimen && dosingRegimen.amount || ''}
											onChange={e => onDosignRegimenValueChange(e.target.value, "amount")} />
										<br />

										{
											(dosingRegimen && dosingRegimen.route === 'Intravenous') && (
												<div>
													<label style={{ marginLeft: "1em" }}>Infusion Duration(hr): </label>
													<input type="text" name="amount"
														value={dosingRegimen && dosingRegimen.duration || ''}
														onChange={e => onDosignRegimenValueChange(e.target.value, "duration")} />
													<br />
												</div>
											)
										}



										<label style={{ marginLeft: "1em" }}>Dosing Interval(hr): </label>
										<input type="text" name="interval"
											value={dosingRegimen && dosingRegimen.interval || ''}
											onChange={e => onDosignRegimenValueChange(e.target.value, "interval")} />
										<br />
									</p>
								)

								}
							</div>
						</div>
					</form>
					<button type="button" className="btn btn-primary" onClick={() => setShowTable(!showTable)} style={{ marginTop: "15px" }}>Customized dosing</button>
					{
						showTable ? (<div>
							<Table {...actions}
								//onAdd={e => actions.batch([new Add(e, true), new Add(new OutputRange({ parent: e, from: Experiment.transientTime, to: Experiment.runTime }), true)])}
								onDrag={null}
								persisted={persisted.Experiment}
								references={[entities.get("DrugScore"), state, selection]}
								owner={model}
								// selected={selected.Experiment}
								data={Seq(model.DrugScore)}
								creator={undefined}
								editable={e => !e.userId}
								columns={[
									{ get: "ID", label: "ID", editable: true, def: "ID" },
									{ get: "Time", label: "Time", editable: true, def: "time" },
									{ get: "dose", label: "Dose(mg)", editable: true, def: "dose" },
									{ get: "route", label: "Route", editable: true, def: "route" },
								]}>
							</Table>
						</div>) : null
					}


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

export default DosingRegimeViewBuilder()