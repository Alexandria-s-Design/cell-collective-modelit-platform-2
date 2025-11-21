import { Seq } from 'immutable';
import JSZip from 'jszip';
import Utils from '../../../utils';
import ExperimentBaseView from './experimentBaseView';

const download = (props, state) => {
	const downloadLocal = ({ selected: { Experiment: experiment }, model: { OutputRange: ranges, Component: components }, modelState }) => {
		const zip = new JSZip();

		const file = (e) => {
			let p = e.first();
			p && (p = p.data) && zip.file("value.csv", [e.map(e => e.component.name).join()].concat(p.map((_, i) => e.map(e => e.data[i].toFixed(1)).join())).join("\r\n"));
		};


		// ======================= Values CSV =======================
		Seq(state && state.get("analysis")).forEach((v, k) => {
			const s = Seq(v).map((v, k) => ({ component: components[k], data: v })).filter(e => e.component).sortBy(e => e.component.name.toLowerCase()).cacheResult();
			const range = ranges[k];
			file(s);
		});


		// ======================= Settings CSV =======================
		const header = ["Experiment Name", "No. of Simulations", "No. of Timesteps", "Slider Window"];
		const data = [
			props.selected.Experiment.name,
			props.selected.Experiment.numSimulations,
			props.selected.Experiment.numTimesteps,
			props.selected.Experiment.sliderWindow
		];

		const csvContent = header.join(",") + "\r\n" + data.join(",");
		zip.file("settings.csv", csvContent);


		//======================= Data CSV ==========================
		// New: Create data.csv from timeSteps
		const timeSteps = state.get("speciesStates");

		if (timeSteps && timeSteps.length > 0) {

			// Get all component names from first entry
			const componentNames = timeSteps && timeSteps.length > 0 
			? timeSteps[0].states.map(c => c.component) 
			: [];

			// Create CSV header
			const dataHeader = ["Simulation", "Timestep", ...componentNames];

			// Create CSV rows
			const dataRows = timeSteps.map(entry => [
				entry.simulation,
				entry.timestep,
				...componentNames.map(name => {
					const componentState = entry.states.find(c => c.component === name);
					return componentState ? componentState.state : 0;
				})
			]);

			// Convert to CSV string
			const dataCsv = [
				dataHeader.join(","),
				...dataRows.map(row => row.join(","))
			].join("\r\n");

			zip.file("data.csv", dataCsv);
		}

		zip.generateAsync({ type: "blob" }).then(e => Utils.downloadBinary(experiment.name + ".zip", e));
	};

	const { selected: { Experiment: e } } = props;

	return Seq(state.get("analysis")).size > 0 && (e.bits && state.get("bitsAvailable") !== false ? () => props.actions.download("simulate/dynamic/export/" + e.Persisted, e.name + " (bits).zip") : downloadLocal.bind(null, props));
};

export default ExperimentBaseView({
	experimentType: "",
	download
});