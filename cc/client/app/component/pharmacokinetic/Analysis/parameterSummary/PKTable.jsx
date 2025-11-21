import React, { useState, useEffect } from "react";
import view from "../../../base/view";
import Panel from "../../../base/panel";
import Table from "../../../base/table";
import * as d3 from "d3";
import { Seq } from "immutable";

const Content = (props) => {
	const [tableData, setTableData] = useState([]);

	const updateTableData = () => {
		const data = props.modelState.getIn(["simulation", "data"]);
		const compartment = props.selected.PKCompartment;
		const compartment_rates = [];
		const newData = [];

		if (data && data.size > 0) {
			const dataKeys = data.keySeq().toArray();

			Seq(props.model.Rate).forEach((rate) => {
				if (rate.fromCompartment === compartment) {
					compartment_rates.push(rate.id);
				}
			});

			Seq(props.model.Parameter).forEach((parameter) => {
				if (
					compartment_rates.includes(parameter.rateId) ||
					parameter.compartment === compartment
				) {
					if (dataKeys.includes(parameter.name)) {
						const paramData = data.get(parameter.name);
						newData.push({
							name: parameter.name,
							median: d3.median(paramData),
							mean: d3.mean(paramData),
							min: d3.min(paramData),
							max: d3.max(paramData),
							sd: d3.deviation(paramData),
						});
					}
				}
			});

			Seq(props.model.Population).forEach((v) => {
				if (v.type === "body-weight") {
					const populationData = data.get("bodyWeight");
					newData.push({
						name: "bodyWeight",
						median: d3.median(populationData),
						mean: d3.mean(populationData),
						min: d3.min(populationData),
						max: d3.max(populationData),
						sd: d3.deviation(populationData),
					});
				} else if (v.type === "age") {
					const populationData = data.get("age");
					newData.push({
						name: "age",
						median: d3.median(populationData),
						mean: d3.mean(populationData),
						min: d3.min(populationData),
						max: d3.max(populationData),
						sd: d3.deviation(populationData),
					});
				}
			});

			const compartmentData = data.get(`mg${compartment.name}`);
			const cmax = [];
			const tmax = [];

			compartmentData &&
				compartmentData.value &&
				compartmentData.value.forEach((arr) => {
					let val = d3.max(arr);
					let valIdx = compartmentData.time[arr.indexOf(val)];
					cmax.push(val);
					tmax.push(valIdx);
				});

			newData.push({
				name: "max",
				median: d3.median(cmax),
				mean: d3.mean(cmax),
				min: d3.min(cmax),
				max: d3.max(cmax),
				sd: d3.deviation(cmax),
			});
			newData.push({
				name: "tmax",
				median: d3.median(tmax),
				mean: d3.mean(tmax),
				min: d3.min(tmax),
				max: d3.max(tmax),
				sd: d3.deviation(tmax),
			});
		}

		setTableData(newData);
	};

	useEffect(() => {
		updateTableData();
	}, [props.selected.PKCompartment]);

	return (
		<Panel {...props.view}>
			<Table
				key={props.selected.PKCompartment && props.selected.PKCompartment.id}
				top="10%"
				data={Seq(tableData)}
				references={[
					props.entities.get("PKCompartment"),
					props.modelState.get("simulation"),
				]}
				columns={[
					{ get: "name", label: "PKParams", def: "_name" },
					{ get: "median", label: "Median", def: "_median" },
					{ get: "mean", label: "Mean", def: "_mean" },
				]}
			/>
		</Panel>
	);
};

export default view(Content, null, null);
