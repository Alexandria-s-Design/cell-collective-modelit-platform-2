import React from "react"
import { Seq } from "immutable"
import view from "../../base/view"
import Panel from "../../base/panel"
import Table from "../../base/table"
import Checkbox from "../../base/checkbox"




export default view(({ view, model, modelState, entities, selected: { PKCompartment: compartment }, actions }) => {

	const onSelectEntity = (actions, e) => {
		actions.onSelect(e);
	}

	const getCheckboxValue = (e) => modelState.getIn(["simulation", "compartmentCheckbox"]).get(e.id, false)
	const amountChecked = (e) => getCheckboxValue(e) == "amount"
	const concentrationChecked = (e) => getCheckboxValue(e) == "concentration"
	const editCheckbox = (e, v) => actions.onEditModelState(["simulation", "compartmentCheckbox", e], v)

	const editExclusiveCheckbox = (e, p, _, event) => {
		event.stopPropagation()
		const value = getCheckboxValue(e)
		const newValue = value == p ? false : p
		editCheckbox(e, newValue)
	}

	return (
		<Panel {...view} className="bar sim2-phase1">
			<Table
				references={[entities.get("PKCompartment"), entities.get("InitialStateComponent"), modelState.get("simulation")]}
				owner={model}
				data={Seq(model.PKCompartment).filterNot(e => e.isExternal)}
				selected={compartment}
				onSelect={e => onSelectEntity(actions, e)}
				search="name"
				columns={[
					{ get: "name", label: "Name", editable: false },
					{
						get: "amount", label: "Amt", editable: false,
						format: e => (
							<Checkbox value={amountChecked(e)} onEdit={editExclusiveCheckbox.bind(null, e, "amount")} />
						)
					},
					{
						get: "concentration", label: "Conc",
						format: e => (
							<Checkbox value={concentrationChecked(e)} onEdit={editExclusiveCheckbox.bind(null, e, "concentration")} />
						)
					}
				]}>
			</Table>
		</Panel>
	)
})
