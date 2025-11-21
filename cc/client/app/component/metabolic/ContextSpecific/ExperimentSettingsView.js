import { ExperimentSettingsViewBuilder } from "../../analysis/experimentView";

export default {
    "gimme": ExperimentSettingsViewBuilder({
        modelType: "metabolic",
				experimentType: "gimme",
				experimentGroupType: "contextSpecific"
    }),
    "imat": ExperimentSettingsViewBuilder({
        modelType: "metabolic",
        experimentType: "imat",
				experimentGroupType: "contextSpecific"
    }),
    "fcore": ExperimentSettingsViewBuilder({
        modelType: "metabolic",
        experimentType: "fcore",
				experimentGroupType: "contextSpecific"
    }),
    "mcadre": ExperimentSettingsViewBuilder({
        modelType: "metabolic",
        experimentType: "mcadre",
				experimentGroupType: "contextSpecific"
    }),
    "init": ExperimentSettingsViewBuilder({
        modelType: "metabolic",
        experimentType: "init",
				experimentGroupType: "contextSpecific"
    })
}