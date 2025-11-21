import Course from './containers/Course';
import { isDevFeatureEnabled, COURSES } from './development/devFeatures';

const LearningSection = {
	source: (e, u) =>
		e
			.map(e => ({ ref: e, w: u.workspace[e.top.id] }))
			.filter(e => e.w && !e.w.id)
			.sortBy(e => (e.ref.top.userId == u.id ? e.ref.updated : e.w))
			.reverse()
			.map(e => e.ref),
	user: true,
	refs: true,
};

export const sanitizeLayoutName = name => {
	if (name && name.indexOf(":") > 0) {
		if (name.indexOf('translate:') === 0) {
			return name;
		}
		name = name.substring(0, name.indexOf(":"))
	}
	return name;
}


export const { source } = LearningSection;


const BooleanOverviewLayout = {
	views: {
		0: {
			"DescriptionView": { left: "0%", top: "0%", width: "35%", height: "70%" },
			"ReferencesView": { left: "0%", top: "70%", width: "35%", height: "30%" },
			"ModelGraphView": { left: "35%", top: "0%", width: "65%", height: "50%" },
			"PagesView": { left: "35%", top: "50%", width: "28%", height: "50%" },
			"PageView": { left: "63%", top: "50%", width: "37%", height: "50%" }
		},
		1000: {
			"DescriptionView": { left: "0%", top: "0%", width: "35%", height: "80%" },
			"ReferencesView": { left: "0%", top: "80%", width: "35%", height: "20%" },
			"ModelGraphView": { left: "35%", top: "0%", width: "65%", height: "50%" },
			"PagesView": { left: "35%", top: "50%", width: "23%", height: "50%" },
			"PageView": { left: "58%", top: "50%", width: "42%", height: "50%" }
		},
		1300: {
			"DescriptionView": { left: "0%", top: "0%", width: "35%", height: "80%" },
			"ReferencesView": { left: "0%", top: "80%", width: "35%", height: "20%" },
			"ModelGraphView": { left: "35%", top: "0%", width: "65%", height: "50%" },
			"PagesView": { left: "35%", top: "50%", width: "18%", height: "50%" },
			"PageView": { left: "53%", top: "50%", width: "47%", height: "50%" }
		},
		1600: {
			"DescriptionView": { left: "0%", top: "0%", width: "35%", height: "80%" },
			"ReferencesView": { left: "0%", top: "80%", width: "35%", height: "20%" },
			"ModelGraphView": { left: "35%", top: "0%", width: "65%", height: "50%" },
			"PagesView": { left: "35%", top: "50%", width: "15%", height: "50%" },
			"PageView": { left: "50%", top: "50%", width: "50%", height: "50%" }
		},
		1900: {
			"DescriptionView": { left: "0%", top: "0%", width: "35%", height: "80%" },
			"ReferencesView": { left: "0%", top: "80%", width: "35%", height: "20%" },
			"ModelGraphView": { left: "35%", top: "0%", width: "65%", height: "50%" },
			"PagesView": { left: "35%", top: "50%", width: "13%", height: "50%" },
			"PageView": { left: "48%", top: "50%", width: "52%", height: "50%" }
		}
	}
};

export default (function () {
	const published = (t, replace_models) => {
		const source = (replace_models ? (e, u) => {
			return e.filter(e => (e.type === t && e.isPublic)).sortBy(e => e.updated).reverse()
				.map(m => {
					if (m.top.id in u.workspace) {
						const umodel = u.workspace[m.top.id];
						if (umodel.top) { return umodel._sub[umodel.top.version]; }
					}
					return m;
				}).filter(m => m !== undefined);
		} : e => {
			return e.filter(e => e.type === t && e.isPublic).sortBy(e => e.updated).reverse();
		});
		return { source };
	}

	const shared = { source: (e, u) => e.filter(e => e.userId != u.id && (!e.isPublic && e.permissions.edit)).sortBy(e => e.updated).reverse(), user: true };

	return {
		null: {
			null: {
				"Home": {
					internal: true,
					editable: false
				},
				"AccountUpgrade": {
					internal: true,
					editable: false,
					views: {
						0: {
							"AccountUpgradeView": { left: "0%", top: "0%", width: "100%", height: "100%" }
						}
					}
				},
				"ModelErr": {
					internal: true,
					editable: false,
					views: {
						0: {
							"ModelErrView": {
								left: "0%", top: "0%", width: "100%", height: "100%"
							}
						}
					}
				},
				"Overview": {

				},
				"Overview:boolean": {
					modelType: "boolean"
				},
				"Overview:metabolic": {
					modelType: "metabolic"
				},
				"Overview:kinetic": {
					modelType: "kinetic"
				},
				"Overview:pharmacokinetic": {
					modelType: "pharmacokinetic"
				},
				"Access": {
					internal: true,
				},
				"Insights": {
					internal: true,
				},
				"Model:boolean": {
					modelType: "boolean",
					views: {
						0: {
							"ModelGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"InternalComponentsView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"ExternalComponentsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"RegulationCenterView(Biologic)": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"PageView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						},
						1200: {
							"ModelGraphView": { left: "0%", top: "0%", width: "34%", height: "100%" },
							"InternalComponentsView": { left: "34%", top: "0%", width: "24%", height: "67%" },
							"ExternalComponentsView": { left: "34%", top: "67%", width: "24%", height: "33%" },
							"RegulationCenterView(Biologic)": { left: "58%", top: "0%", width: "42%", height: "50%" },
							"PageView": { left: "58%", top: "50%", width: "42%", height: "50%" }
						},
						1400: {
							"ModelGraphView": { left: "0%", top: "0%", width: "42%", height: "100%" },
							"InternalComponentsView": { left: "42%", top: "0%", width: "18%", height: "67%" },
							"ExternalComponentsView": { left: "42%", top: "67%", width: "18%", height: "33%" },
							"RegulationCenterView(Biologic)": { left: "60%", top: "0%", width: "40%", height: "50%" },
							"PageView": { left: "60%", top: "50%", width: "40%", height: "50%" }
						},
						1600: {
							"ModelGraphView": { left: "0%", top: "0%", width: "50%", height: "100%" },
							"InternalComponentsView": { left: "50%", top: "0%", width: "15%", height: "67%" },
							"ExternalComponentsView": { left: "50%", top: "67%", width: "15%", height: "33%" },
							"RegulationCenterView(Biologic)": { left: "65%", top: "0%", width: "35%", height: "50%" },
							"PageView": { left: "65%", top: "50%", width: "35%", height: "50%" }
						},
						1900: {
							"ModelGraphView": { left: "0%", top: "0%", width: "57%", height: "100%" },
							"InternalComponentsView": { left: "57%", top: "0%", width: "13%", height: "67%" },
							"ExternalComponentsView": { left: "57%", top: "67%", width: "13%", height: "33%" },
							"RegulationCenterView(Biologic)": { left: "70%", top: "0%", width: "30%", height: "50%" },
							"PageView": { left: "70%", top: "50%", width: "30%", height: "50%" }
						}
					},
					description: "Enables model creation and editing using either Regulation Center or Visual Editor. Suitable for smaller models."
				},
				"Model:metabolic": {
					modelType: "metabolic",
					views: {
						0: {
							"MetabolicGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"MetabolitesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"ReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"ReactionView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"MetabolicKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						}
					},
					layouts: {
						"Model": {
							modelType: "metabolic",
							views: {
								0: {
									"MetabolicGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
									"MetabolitesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
									"ReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
									"ReactionView": { left: "67%", top: "0%", width: "33%", height: "50%" },
									"MetabolicKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" }
								}
							},
						},
						"Gene Regulation": {
							modelType: "metabolic",
							views: {
								0: {
									"MetabolicGraphView": { left: "0%", top: "0%", width: "45%", height: "100%" },
									"ReactionsView": { left: "45%", top: "0%", width: "25%", height: "60%" },
									"GenesView": { left: "45%", top: "60%", width: "25%", height: "40%" },
									"RegulatoryMechanismView": { left: "70%", top: "0%", width: "30%", height: "50%" },
									"MetabolicKnowledgeBaseView": { left: "70%", top: "50%", width: "30%", height: "50%" }
								}
							},
						},
						"Objective Function": {
							modelType: "metabolic",
							views: {
								0: {
									"ObjectiveFunctionsView": { left: "0%", top: "0%", width: "28%", height: "100%" },
									"ObjectiveFunctionBuilderView": { left: "28%", top: "0%", width: "36%", height: "50%" },
									"ObjectiveFunctionsReactionsView": { left: "28%", top: "50%", width: "36%", height: "50%" },
									"MetabolicKnowledgeBaseView": { left: "64%", top: "0%", width: "36%", height: "100%" }
								}
							}
						}
					}
				},
				"Model:kinetic": {
					modelType: "kinetic",
					views: {
						0: {
							"KineticGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"KineticSpeciesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"KineticReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"KineticLawView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"KineticKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						}
					}
				},
				"Model:pharmacokinetic": {
					modelType: "pharmacokinetic",
					views: {
						0: {
							"PharmacoKineticGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"PharmacoKineticParametersView": { left: "39%", top: "0%", width: "28%", height: "30%" },
							"PharmacoKineticCompartmentView": { left: "39%", top: "30%", width: "28%", height: "30%" },
							"PharmacoKineticParametersSetupView": { left: "39%", top: "60%", width: "28%", height: "40%" },
							"PharmacoKineticPopulationView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"PharmacoKineticDosingRegimeView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						}
					}

				},
				"Overview": {

				},
				"Overview:boolean": {
					modelType: "boolean"
				},
				"Overview:metabolic": {
					modelType: "metabolic"
				},
				"Overview:kinetic": {
					modelType: "kinetic"
				},
				"Overview:pharmacokinetic": {
					modelType: "pharmacokinetic"
				},
				"Access": {
					internal: true,
				},
				"Insights": {
					internal: true,
				},
				"Model:boolean": {
					modelType: "boolean",
					views: {
						0: {
							"ModelGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"InternalComponentsView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"ExternalComponentsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"RegulationCenterView(Biologic)": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"PageView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						},
						1200: {
							"ModelGraphView": { left: "0%", top: "0%", width: "34%", height: "100%" },
							"InternalComponentsView": { left: "34%", top: "0%", width: "24%", height: "67%" },
							"ExternalComponentsView": { left: "34%", top: "67%", width: "24%", height: "33%" },
							"RegulationCenterView(Biologic)": { left: "58%", top: "0%", width: "42%", height: "50%" },
							"PageView": { left: "58%", top: "50%", width: "42%", height: "50%" }
						},
						1400: {
							"ModelGraphView": { left: "0%", top: "0%", width: "42%", height: "100%" },
							"InternalComponentsView": { left: "42%", top: "0%", width: "18%", height: "67%" },
							"ExternalComponentsView": { left: "42%", top: "67%", width: "18%", height: "33%" },
							"RegulationCenterView(Biologic)": { left: "60%", top: "0%", width: "40%", height: "50%" },
							"PageView": { left: "60%", top: "50%", width: "40%", height: "50%" }
						},
						1600: {
							"ModelGraphView": { left: "0%", top: "0%", width: "50%", height: "100%" },
							"InternalComponentsView": { left: "50%", top: "0%", width: "15%", height: "67%" },
							"ExternalComponentsView": { left: "50%", top: "67%", width: "15%", height: "33%" },
							"RegulationCenterView(Biologic)": { left: "65%", top: "0%", width: "35%", height: "50%" },
							"PageView": { left: "65%", top: "50%", width: "35%", height: "50%" }
						},
						1900: {
							"ModelGraphView": { left: "0%", top: "0%", width: "57%", height: "100%" },
							"InternalComponentsView": { left: "57%", top: "0%", width: "13%", height: "67%" },
							"ExternalComponentsView": { left: "57%", top: "67%", width: "13%", height: "33%" },
							"RegulationCenterView(Biologic)": { left: "70%", top: "0%", width: "30%", height: "50%" },
							"PageView": { left: "70%", top: "50%", width: "30%", height: "50%" }
						}
					},
					description: "Enables model creation and editing using either Regulation Center or Visual Editor. Suitable for smaller models."
				},
				"Model:metabolic": {
					modelType: "metabolic",
					views: {
						0: {
							"MetabolicGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"MetabolitesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"ReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"ReactionView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"MetabolicKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						},
						1000: {
							"MetabolicGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"MetabolitesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"ReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"ReactionView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"MetabolicKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						},
						1300: {
							"MetabolicGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"MetabolitesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"ReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"ReactionView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"MetabolicKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						},
						1600: {
							"MetabolicGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"MetabolitesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"ReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"ReactionView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"MetabolicKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						},
						1900: {
							"MetabolicGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"MetabolitesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"ReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"ReactionView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"MetabolicKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						}
					},
					layouts: {
						"Model": {
							modelType: "metabolic",
							views: {
								0: {
									"MetabolicGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
									"MetabolitesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
									"ReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
									"ReactionView": { left: "67%", top: "0%", width: "33%", height: "50%" },
									"MetabolicKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" },
									
								}
							},
						},
						"Gene Regulation": {
							modelType: "metabolic",
							views: {
								0: {
									"MetabolicGraphView": { left: "0%", top: "0%", width: "45%", height: "100%" },
									"ReactionsView": { left: "45%", top: "0%", width: "25%", height: "60%" },
									"GenesView": { left: "45%", top: "60%", width: "25%", height: "40%" },
									"RegulatoryMechanismView": { left: "70%", top: "0%", width: "30%", height: "50%" },
									"MetabolicKnowledgeBaseView": { left: "70%", top: "50%", width: "30%", height: "50%" }
								}
							},
						},
						"Objective Function": {
							modelType: "metabolic",
							views: {
								0: {
									"ObjectiveFunctionsView": { left: "0%", top: "0%", width: "28%", height: "100%" },
									"ObjectiveFunctionBuilderView": { left: "28%", top: "0%", width: "36%", height: "50%" },
									"ObjectiveFunctionsReactionsView": { left: "28%", top: "50%", width: "36%", height: "50%" },
									"MetabolicKnowledgeBaseView": { left: "64%", top: "0%", width: "36%", height: "100%" }
								}
							}
						}
					}
				},
				"Model:kinetic": {
					modelType: "kinetic",
					views: {
						0: {
							"KineticGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"KineticSpeciesView": { left: "39%", top: "0%", width: "28%", height: "50%" },
							"KineticReactionsView": { left: "39%", top: "50%", width: "28%", height: "50%" },
							"KineticLawView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"KineticKnowledgeBaseView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						}
					}
				},
				"Model:pharmacokinetic": {
					modelType: "pharmacokinetic",
					views: {
						0: {
							"PharmacoKineticGraphView": { left: "0%", top: "0%", width: "39%", height: "100%" },
							"PharmacoKineticParametersView": { left: "39%", top: "0%", width: "28%", height: "30%" },
							"PharmacoKineticCompartmentView": { left: "39%", top: "30%", width: "28%", height: "30%" },
							"PharmacoKineticParametersSetupView": { left: "39%", top: "60%", width: "28%", height: "40%" },
							"PharmacoKineticPopulationView": { left: "67%", top: "0%", width: "33%", height: "50%" },
							"PharmacoKineticDosingRegimeView": { left: "67%", top: "50%", width: "33%", height: "50%" }
						}
					}
				},
				"Simulation": {
					modelType: "boolean",
					views: {
						0: {
							"SimulationControlView": { left: "0%", top: "0%", width: "35%", height: "35%" },
							"SimulationExternalComponentsView": { left: "0%", top: "35%", width: "35%", height: "35%" },
							"SimulationInternalComponentsView": { left: "0%", top: "70%", width: "35%", height: "30%" },
							"SimulationNetAbsoluteView": { left: "35%", top: "0%", width: "32%", height: "100%" },
							"SimulationGraphView": { left: "67%", top: "0%", width: "32%", height: "100%" }
						},
						1000: {
							"SimulationControlView": { left: "0%", top: "0%", width: "32%", height: "35%" },
							"SimulationExternalComponentsView": { left: "0%", top: "35%", width: "32%", height: "35%" },
							"SimulationInternalComponentsView": { left: "0%", top: "70%", width: "32%", height: "30%" },
							"SimulationNetAbsoluteView": { left: "32%", top: "0%", width: "34%", height: "100%" },
							"SimulationGraphView": { left: "66%", top: "0%", width: "34%", height: "100%" }
						},
						1300: {
							"SimulationControlView": { left: "0%", top: "0%", width: "27%", height: "30%" },
							"SimulationExternalComponentsView": { left: "0%", top: "30%", width: "27%", height: "40%" },
							"SimulationInternalComponentsView": { left: "0%", top: "70%", width: "27%", height: "30%" },
							"SimulationNetAbsoluteView": { left: "27%", top: "0%", width: "36%", height: "100%" },
							"SimulationGraphView": { left: "63%", top: "0%", width: "36%", height: "100%" }
						},
						1600: {
							"SimulationControlView": { left: "0%", top: "0%", width: "23%", height: "27%" },
							"SimulationExternalComponentsView": { left: "0%", top: "27%", width: "23%", height: "38%" },
							"SimulationInternalComponentsView": { left: "0%", top: "65%", width: "23%", height: "35%" },
							"SimulationNetAbsoluteView": { left: "23%", top: "0%", width: "38%", height: "100%" },
							"SimulationGraphView": { left: "61%", top: "0%", width: "38%", height: "100%" }
						},
						1900: {
							"SimulationControlView": { left: "0%", top: "0%", width: "20%", height: "27%" },
							"SimulationExternalComponentsView": { left: "0%", top: "27%", width: "20%", height: "38%" },
							"SimulationInternalComponentsView": { left: "0%", top: "65%", width: "20%", height: "35%" },
							"SimulationNetAbsoluteView": { left: "20%", top: "0%", width: "40%", height: "100%" },
							"SimulationGraphView": { left: "60%", top: "0%", width: "40%", height: "100%" }
						}
					}
				},
				"Simulation:pharmacokinetic": {
					modelType: "pharmacokinetic",
					views: {
						0: {
							"PharmacoKineticSimulationControl": { left: "0%", top: "0%", width: "35%", height: "35%" },
							"PharmacoKineticDisplayedCompartments": { left: "0%", top: "35%", width: "35%", height: "35%" },
							"PharmacoKineticProfileComparison": { left: "35%", top: "0%", width: "32%", height: "100%" },
							"PharmacoKineticExposureProfile": { left: "67%", top: "0%", width: "32%", height: "100%" },
						},
						1000: {
							"PharmacoKineticSimulationControl": { left: "0%", top: "0%", width: "32%", height: "35%" },
							"PharmacoKineticDisplayedCompartments": { left: "0%", top: "35%", width: "32%", height: "35%" },
							"PharmacoKineticProfileComparison": { left: "32%", top: "0%", width: "34%", height: "100%" },
							"PharmacoKineticExposureProfile": { left: "67%", top: "0%", width: "32%", height: "100%" },
						},
						1300: {
							"PharmacoKineticSimulationControl": { left: "0%", top: "0%", width: "27%", height: "30%" },
							"PharmacoKineticDisplayedCompartments": { left: "0%", top: "30%", width: "27%", height: "40%" },
							"PharmacoKineticProfileComparison": { left: "27%", top: "0%", width: "36%", height: "100%" },
							"PharmacoKineticExposureProfile": { left: "67%", top: "0%", width: "32%", height: "100%" },
						},
						1600: {
							"PharmacoKineticSimulationControl": { left: "0%", top: "0%", width: "23%", height: "27%" },
							"PharmacoKineticDisplayedCompartments": { left: "0%", top: "27%", width: "23%", height: "38%" },
							"PharmacoKineticProfileComparison": { left: "23%", top: "0%", width: "38%", height: "100%" },
							"PharmacoKineticExposureProfile": { left: "67%", top: "0%", width: "32%", height: "100%" },
						},
						1900: {
							"PharmacoKineticSimulationControl": { left: "0%", top: "0%", width: "20%", height: "27%" },
							"PharmacoKineticDisplayedCompartments": { left: "0%", top: "27%", width: "20%", height: "38%" },
							"PharmacoKineticProfileComparison": { left: "20%", top: "0%", width: "40%", height: "100%" },
							"PharmacoKineticExposureProfile": { left: "67%", top: "0%", width: "32%", height: "100%" },
						}
					}
				},
				"Analysis": {
					modelType: "boolean",
					layouts: {
						"translate:ModelDashBoard.ModelMenu.LabelDoseResponse": {
							views: {
								0: {
									"ExperimentsView": { left: "0%", top: "0%", width: "26%", height: "50%" },
									"ExperimentView": { left: "0%", top: "50%", width: "32%", height: "50%" },
									"ExperimentExternalComponentsView": { left: "26%", top: "0%", width: "37%", height: "50%" },
									"ExperimentInternalComponentsView": { left: "32%", top: "50%", width: "31%", height: "50%" },
									"AnalysisGraphView": { left: "64%", top: "0%", width: "36%", height: "50%" },
									"AnalysisComponentsView": { left: "64%", top: "50%", width: "36%", height: "50%" }
								},
								1000: {
									"ExperimentsView": { left: "0%", top: "0%", width: "21%", height: "50%" },
									"ExperimentView": { left: "0%", top: "50%", width: "30%", height: "50%" },
									"ExperimentExternalComponentsView": { left: "21%", top: "0%", width: "35%", height: "50%" },
									"ExperimentInternalComponentsView": { left: "30%", top: "50%", width: "26%", height: "50%" },
									"AnalysisGraphView": { left: "57%", top: "0%", width: "43%", height: "50%" },
									"AnalysisComponentsView": { left: "57%", top: "50%", width: "43%", height: "50%" }
								},
								1300: {
									"ExperimentsView": { left: "0%", top: "0%", width: "18%", height: "66%" },
									"ExperimentView": { left: "0%", top: "66%", width: "23%", height: "34%" },
									"ExperimentExternalComponentsView": { left: "18%", top: "0%", width: "27%", height: "66%" },
									"ExperimentInternalComponentsView": { left: "23%", top: "66%", width: "22%", height: "34%" },
									"AnalysisGraphView": { left: "46%", top: "0%", width: "36%", height: "100%" },
									"AnalysisComponentsView": { left: "82%", top: "0%", width: "18%", height: "100%" }
								},
								1600: {
									"ExperimentView": { left: "0%", top: "0%", width: "19%", height: "34%" },
									"ExperimentsView": { left: "0%", top: "34%", width: "19%", height: "66%" },
									"ExperimentExternalComponentsView": { left: "19%", top: "0%", width: "18%", height: "66%" },
									"ExperimentInternalComponentsView": { left: "19%", top: "66%", width: "18%", height: "34%" },
									"AnalysisGraphView": { left: "37%", top: "0%", width: "38%", height: "100%" },
									"AnalysisComponentsView": { left: "92%", top: "0%", width: "13%", height: "100%" }
								},
								1900: {
									"ExperimentView": { left: "0%", top: "0%", width: "19%", height: "38%" },
									"ExperimentsView": { left: "0%", top: "38%", width: "19%", height: "62%" },
									"ExperimentExternalComponentsView": { left: "19%", top: "0%", width: "18%", height: "66%" },
									"ExperimentInternalComponentsView": { left: "19%", top: "66%", width: "18%", height: "34%" },
									"AnalysisGraphView": { left: "37%", top: "0%", width: "48%", height: "100%" },
									"AnalysisComponentsView": { left: "85%", top: "0%", width: "15%", height: "100%" }
								}
							}
						},
						"translate:ModelDashBoard.ModelMenu.LabelEnvironmentSensitivity": {
							views: {
								0: {
									"ExperimentsSensitivityView": { left: "0%", top: "0%", width: "26%", height: "50%" },
									"ExperimentSensitivityView": { left: "0%", top: "50%", width: "32%", height: "50%" },
									"ExperimentSensitivityExternalComponentsView": { left: "26%", top: "0%", width: "37%", height: "50%" },
									"ExperimentSensitivityInternalComponentsView": { left: "32%", top: "50%", width: "31%", height: "50%" },
									"ComponentSensitivity": { left: "64%", top: "0%", width: "36%", height: "50%" },
									"EnvironmentSensitivity": { left: "64%", top: "50%", width: "36%", height: "50%" }
								},
							}
						},
						"translate:ModelDashBoard.ModelMenu.LabelAutomatedSimulation": {
							views: {
								0: {
									"AutomatedSimulationViewExperimentSetting":  { left: "0%", top: "0%", width: "30%", height: "70%" },
									"ExperimentsView":  { left: "0%", top: "70%", width: "30%", height: "30%" },
									"ExperimentSensitivityExternalComponentsView":  { left: "30%", top: "0%", width: "30%", height: "100%" },
									"InternalComponentsView":  { left: "60%", top: "0%", width: "40%", height: "100%" },
								}
							}
						}
					}
				},
				"Analysis:metabolic": {
					modelType: "metabolic",
					layouts: {
						"translate:ModelDashBoard.ModelMenu.FluxBalanceAnalysis": {
							views: {
								0: {
									"MetabolicExperimentsView": { left: "0%", top: "0%", width: "19%", height: "38%" },
									"ExperimentSettingsView": { left: "0%", top: "38%", width: "19%", height: "62%" },
									"FluxControlView": { left: "19%", top: "0%", width: "18%", height: "66%" },
									"GeneControlView": { left: "19%", top: "66%", width: "18%", height: "34%" },
									"MetabolicGraphView": { left: "37%", top: "0%", width: "48%", height: "100%" },
									"ReactionFluxView": { left: "85%", top: "0%", width: "15%", height: "100%" }
								}
							}
						},
						"translate:ModelDashBoard.ModelMenu.FluxVariabilityAnalysis": {
							views: {
								0: {
									"FVAMetabolicExperimentsView": { left: "0%", top: "0%", width: "20%", height: "50%" },
									"FVAExperimentSettingsView": { left: "0%", top: "50%", width: "20%", height: "50%" },
									"FluxControlView": { left: "20%", top: "0%", width: "30%", height: "100%" },
									"GeneControlView": { left: "50%", top: "0%", width: "20%", height: "100%" },
									"FluxVariabilityResultsView": { left: "70%", top: "0%", width: "30%", height: "100%" }
								},
							}
						},
						"translate:ModelDashBoard.ModelMenu.DrugIdentification": {
							views: {
									0: {
										"FVAMetabolicExperimentsView": { left: "0%", top: "0%", width: "20%", height: "50%" },
										"ExperimentUploadSettingsView": { left: "0%", top: "50%", width: "20%", height: "50%" },
										"DrugList" : { left: "20%", top: "0%", width: "80%", height: "100%" },
									},
							}
						}
					}
				},
				"Analysis:kinetic": {
					modelType: "kinetic",
					views: {
						0: {
							"KineticExperimentView": { left: "0%", top: "0%", width: "20%", height: "50%" },
							"KineticExperimentSettingView": { left: "0%", top: "50%", width: "20%", height: "50%" },
							"KineticAnalysisReactionsView": { left: "20%", top: "0%", width: "20%", height: "50%" },
							"KineticAnalysisParametersView": { left: "20%", top: "50%", width: "20%", height: "50%" },
							"KineticAnalysisSpeciesView": { left: "40%", top: "0%", width: "20%", height: "100%" },
							"KineticActivityRelationshipView": { left: "60%", top: "0%", width: "40%", height: "100%"}
						}
					}
				},
				"Analysis:pharmacokinetic": {
					modelType: "pharmacokinetic",
					layouts: {
						"Parameter summary": {
							views: {
								0: {
									"PharmacoKineticSimulationControl": { left: "0%", top: "0%", width: "35%", height: "30%" },
									"PharmacoKineticDisplayedCompartments": { left: "0%", top: "30%", width: "35%", height: "35%" },
									"PharmacoKineticParameterSummaryPrimaryGraph": { left: "35%", top: "0%", width: "65%", height: "50%" },
									"PharmacoKineticParameterSummarySecondaryGraph": { left: "35%", top: "50%", width: "65%", height: "50%" },
									"PharmacoKineticParameterSummaryParameterTable": { left: "0%", top: "65%", width: "35%", height: "35%" }
								}
							}
						},
						"Virtual Clinical Trial": {
							views: {
								0: {
									"PharmacoKineticSimulationControl": { left: "0%", top: "0%", width: "35%", height: "30%" },
									"PharmacoKineticDisplayedCompartments": { left: "0%", top: "30%", width: "35%", height: "50%" },
									"PharmacoKineticVirtualTrials": { left: "0%", top: "80%", width: "35%", height: "20%" },
									"PharmacoKineticProfileComparison": { left: "35%", top: "0%", width: "35%", height: "50%" },
									"PharmacoKineticProfileComparison2": { left: "35%", top: "50%", width: "35%", height: "50%" },
									"PharmacoKineticExposureProfile": { left: "70%", top: "0%", width: "35%", height: "50%" }
								}
							}
						},
						"Parameter sensitivity": {
							views: {
								0: {
									"PharmacoKineticSimulationControl": { left: "0%", top: "0%", width: "35%", height: "35%" },
									"PharmacoKineticDisplayedCompartments": { left: "0%", top: "35%", width: "35%", height: "35%" },
									"PharmacoKineticParametersViewAn": { left: "35%", top: "0%", width: "35%", height: "50%" },
									"PharmacoKineticProfileComparison": { left: "70%", top: "0%", width: "30%", height: "50%" },
									"PharmacoKineticObservation": { left: "0%", top: "70%", width: "35%", height: "30%" },
								}
							}
						},
					}
				},
				"Network Analysis": {
					modelType: "boolean",
				},
				"Knowledge Base": {
					modelType: "boolean",
					views: {
						0: {
							"PagesView": { left: "0%", top: "0%", width: "28%", height: "100%" },
							"PageView": { left: "28%", top: "0%", width: "36%", height: "100%" },
							"ReferenceGraphView": { left: "64%", top: "0%", width: "36%", height: "100%" }
						},
						1000: {
							"PagesView": { left: "0%", top: "0%", width: "24%", height: "100%" },
							"PageView": { left: "24%", top: "0%", width: "38%", height: "100%" },
							"ReferenceGraphView": { left: "62%", top: "0%", width: "38%", height: "100%" }
						},
						1300: {
							"PagesView": { left: "0%", top: "0%", width: "18%", height: "100%" },
							"PageView": { left: "18%", top: "0%", width: "41%", height: "100%" },
							"ReferenceGraphView": { left: "59%", top: "0%", width: "41%", height: "100%" }
						},
						1600: {
							"PagesView": { left: "0%", top: "0%", width: "16%", height: "100%" },
							"PageView": { left: "16%", top: "0%", width: "42%", height: "100%" },
							"ReferenceGraphView": { left: "58%", top: "0%", width: "42%", height: "100%" }
						},
						1900: {
							"PagesView": { left: "0%", top: "0%", width: "14%", height: "100%" },
							"PageView": { left: "14%", top: "0%", width: "43%", height: "100%" },
							"ReferenceGraphView": { left: "57%", top: "0%", width: "43%", height: "100%" }
						}
					}
				},
				"Knowledge Base:metabolic": {
					modelType: "metabolic",
					views: {
						0: {
							"KnowledgeBaseMetabolitesView": { left: "0%", top: "0%", width: "30%", height: "50%" },
							"KnowledgeBaseReactionsView": { left: "0%", top: "50%", width: "15%", height: "50%" },
							"KnowledgeBaseGenesView": { left: "15%", top: "50%", width: "15%", height: "50%" },
							"MetabolicKnowledgeBaseView": { left: "30%", top: "0%", width: "35%", height: "100%" },
							"KnowledgeBaseMetabolicGraphView": { left: "65%", top: "0%", width: "35%", height: "100%" }
						}
						// TODO (Metabolic): Other Configurations
					}
				},
				"Knowledge Base:kinetic": {
					modelType: "kinetic",
					views: {
						0: {
							"KineticMetabolitesView": { left: "0%", top: "0%", width: "30%", height: "50%" },
							"KnowledgeBaseKineticReactionsView": { left: "0%", top: "50%", width: "30%", height: "50%" },
							"KineticKnowledgeBaseView": { left: "30%", top: "0%", width: "35%", height: "100%" },
							"KnowledgeBaseKineticGraphView": { left: "65%", top: "0%", width: "35%", height: "100%" }
						}
					}
				},
				"Context Specific": {
					modelType: "metabolic",
					layouts: {
						"iMAT": {
							views: {
								0: {
									"iMATModelCreationSettingsView":  { left: "0%", top: "0%", width: "30%", height: "100%" },
									"iMATBoundaryReactionsView":  { left: "30%", top: "0%", width: "50%", height: "100%" },
									"iMATCoreReactionsView":  { left: "80%", top: "0%", width: "20%", height: "45%" },
									"iMATExcludeReactionsView":  { left: "80%", top: "45%", width: "20%", height: "45%" },
									"iMATButtonCreateModelView":  { left: "80%", top: "90%", width: "20%", height: "10%" },
								}
							}
						},
						"GIMME": {
							views: {
								0: {
									"GIMMEObjectiveFunctionsView": { left: "0%", top: "0%", width: "30%", height: "20%" },
									"GIMMEModelCreationSettingsView":  { left: "0%", top: "20%", width: "30%", height: "80%" },
									"GIMMEBoundaryReactionsView":  { left: "30%", top: "0%", width: "50%", height: "100%" },
									"GIMMECoreReactionsView":  { left: "80%", top: "0%", width: "20%", height: "45%" },
									"GIMMEExcludeReactionsView":  { left: "80%", top: "45%", width: "20%", height: "45%" },
									"GIMMEButtonCreateModelView":  { left: "80%", top: "90%", width: "20%", height: "10%" },
								}
							}
						},
						"Fast Core": {
							views: {
								0: {
									"FastCoreModelCreationSettingsView":  { left: "0%", top: "0%", width: "100%", height: "80%" },
									"FastCoreButtonCreateModelView":  { left: "0%", top: "80%", width: "100%", height: "20%" },
								}
							}
						},
						// "mCADRE": {
						// 	views: {
						// 		0: {
						// 			"mCADREExperimentsView": { left: "0%", top: "0%", width: "20%", height: "50%" },
						// 			"mCADREExperimentSettingsView": { left: "0%", top: "50%", width: "20%", height: "50%" },
						// 		}
						// 	}
						// },
						// "iNIT": {
						// 	views: {
						// 		0: {
						// 			"iNITExperimentsView": { left: "0%", top: "0%", width: "20%", height: "50%" },
						// 			"iNITExperimentSettingsView": { left: "0%", top: "50%", width: "20%", height: "50%" }
						// 		}
						// 	}
						// }
					}
				},
				"Sharing": {
					internal: true,
					modelType: "boolean",
					minAccess: 2,
					views: {
						0: {
							"SharingView": { left: "0%", top: "0%", width: "33%", height: "50%" },
							"LinksView": { left: "0%", top: "50%", width: "33%", height: "50%" },
							"PublishingView": { left: "33%", top: "0%", width: "41%", height: "100%" },
							"ExperimentsPublishingView": { left: "74%", top: "0%", width: "26%", height: "100%" }
						},
						1000: {
							"SharingView": { left: "0%", top: "0%", width: "45%", height: "50%" },
							"LinksView": { left: "0%", top: "50%", width: "45%", height: "50%" },
							"PublishingView": { left: "45%", top: "0%", width: "34%", height: "100%" },
							"ExperimentsPublishingView": { left: "79%", top: "0%", width: "21%", height: "100%" }
						},
						1300: {
							"SharingView": { left: "0%", top: "0%", width: "35%", height: "50%" },
							"LinksView": { left: "0%", top: "50%", width: "35%", height: "50%" },
							"PublishingView": { left: "35%", top: "0%", width: "47%", height: "100%" },
							"ExperimentsPublishingView": { left: "82%", top: "0%", width: "18%", height: "100%" }
						},
						1600: {
							"SharingView": { left: "0%", top: "0%", width: "30%", height: "50%" },
							"LinksView": { left: "0%", top: "50%", width: "30%", height: "50%" },
							"PublishingView": { left: "30%", top: "0%", width: "55%", height: "100%" },
							"ExperimentsPublishingView": { left: "85%", top: "0%", width: "15%", height: "100%" }
						},
						1900: {
							"SharingView": { left: "0%", top: "0%", width: "25%", height: "50%" },
							"LinksView": { left: "0%", top: "50%", width: "25%", height: "50%" },
							"PublishingView": { left: "25%", top: "0%", width: "62%", height: "100%" },
							"ExperimentsPublishingView": { left: "87%", top: "0%", width: "13%", height: "100%" }
						}
					}
				},
				"Description": {
					minAccess: 1
				},
			},
			research: {
				"Overview": BooleanOverviewLayout,
				"Overview:boolean": BooleanOverviewLayout,
				"Overview:metabolic": {
					views: {
						0: {
							"DescriptionView": { left: "0%", top: "0%", width: "35%", height: "70%" },
							"ReferencesView": { left: "0%", top: "70%", width: "35%", height: "30%" },
							"MetabolicGraphView": { left: "35%", top: "0%", width: "65%", height: "50%" },
							"KnowledgeBaseReactionsView": { left: "35%", top: "50%", width: "28%", height: "50%" },
							"MetabolicKnowledgeBaseView": { left: "63%", top: "50%", width: "37%", height: "50%" }
						}
					}
				},
				"Overview:kinetic": {
					views: {
						0: {
							"DescriptionView": { left: "0%", top: "0%", width: "35%", height: "70%" },
							"ReferencesView": { left: "0%", top: "70%", width: "35%", height: "30%" },
							"KineticGraphView": { left: "35%", top: "0%", width: "65%", height: "50%" },
							"KnowledgeBaseKineticReactionsView": { left: "35%", top: "50%", width: "28%", height: "50%" },
							"MetabolicKnowledgeBaseView": { left: "63%", top: "50%", width: "37%", height: "50%" }
						}
					}
				},
				"Description": {
					views: {
						0: {
							"DescriptionView": { left: "0%", top: "0%", width: "50%", height: "100%" },
							"ReferencesView": { left: "50%", top: "0%", width: "50%", height: "100%" }
						}
					}
				},
				"Network Analysis": {
					layouts: {
						"translate:ModelDashBoardModelMenuLabelTopology": {
							views: {
								0: {
									"TopologyView": { left: "0%", top: "0%", width: "13%", height: "100%" },
									"ConnectivityView": { left: "15%", top: "0%", width: "43.5%", height: "50%" },
									"InDegreeView": { left: "15%", top: "50%", width: "21.75%", height: "50%" },
									"OutDegreeView": { left: "36.75%", top: "50%", width: "21.75%", height: "50%" },
									"ClosenessView": { left: "58.5%", top: "0%", width: "41.5%", height: "100%" }
								},
								1000: {
									"TopologyView": { left: "0%", top: "0%", width: "15%", height: "100%" },
									"ConnectivityView": { left: "15%", top: "0%", width: "43.5%", height: "50%" },
									"InDegreeView": { left: "15%", top: "50%", width: "21.75%", height: "50%" },
									"OutDegreeView": { left: "36.75%", top: "50%", width: "21.75%", height: "50%" },
									"ClosenessView": { left: "58.5%", top: "0%", width: "41.5%", height: "100%" }
								}
							}
						},
						"translate:ModelDashBoardModelMenuLabelFeedbackLoops": {
							views: {
								0: {
									"FeedbackLoopTableView": { left: "0%", top: "0%", width: "30%", height: "100%" },
									"FeedbackLoopGraphView": { left: "30%", top: "0%", width: "35%", height: "100%" },
									"ModelGraphView": { left: "65%", top: "0%", width: "35%", height: "100%" }
								}
							}
						},
						"translate:ModelDashBoardModelMenuLabelStateSpaceAnalysis": {
							views: {
								0: {
									"StateTransitionGraphView": { left: "0%", top: "0%", width: "100%", height: "100%" }
								}
							}
						}
					}
				}
			},
			learning: {
				"Overview": {
					views: {
						0: {
							"LearningView": { left: "0%", top: "0%", width: "75%", height: "35%" },
							"LearningObjectiveView": { left: "0%", top: "35%", width: "75%", height: "40%" },
							"LearningDocumentsView": { left: "0%", top: "75%", width: "50%", height: "25%" },
							"LearningReferencesView": { left: "50%", top: "75%", width: "50%", height: "25%" },
							"LearningPropertiesView": { left: "75%", top: "15%", width: "25%", height: "60%" },
							"StartButtonView": { left: "75%", top: "0%", width: "25%", height: "15%" }
						}
					}
				},
			},
		},
		research: {
			null: {
				"Home": {
					views: {
						0: {
							"ModelsView": {
								left: "0%", top: "0%", width: "100%", height: "100%", sections: {
									"translate:ModelDashBoard.Research.LabelPublishedModels": {
										"translate:ModelDashBoard.Research.LabelRecentlyPublished": published("research"),
										"translate:ModelDashBoard.Research.LabelMostPopular": { source: e => e.filter(e => e.type === "research" && e.isPublic).sortBy(e => e.cited).reverse() },
										"translate:ModelDashBoard.Research.LabelRecommendedToYou": { source: e => e.filter(e => e.type === "research" && e.isPublic).sortBy(e => e.ratingNum * (e.rating / 5 - 0.5)).reverse() }
									},
									"translate:ModelDashBoard.Research.LabelMyModels": { source: (e, u) => e.filter(e => e.userId == u.id && e.type === "research").sortBy(e => e.updated).reverse() },
									"translate:ModelDashBoard.Research.LabelSharedWithMe": shared
								}
							}
						}
					}
				},
			}
		},
		teaching: {
			null: {
				"Home": {
					views: {
						0: {
							"ModelsView": {
								left: "0%", top: "0%", width: "100%", height: "100%", sections: {
									"translate:ModelDashBoardLearningLabelPublicModules": published("learning", true),
									"translate:ModelDashBoardLearningMyModules": { source: (e, u) => (e.filter((v, e) => v.userId == u.id && !((e = u.workspace[e]) && !e.id)).sortBy(e => e.updated).reverse()) },
									"translate:ModelDashBoardLearningSharedWithMe": shared,
									'translate:ModelDashBoardLearningLabelCourses': {
										el: Course,
									},
								}
							}
						}
					}
				},
				"Access": {
					views: {
						0: {
							"LearningAccess": { left: "0%", top: "0%", width: "100%", height: "100%" }
						}
					}
				},
				"Insights": {
					views: {
						0: {
							"LearningInsightsContainer": { left: "0%", top: "0%", width: "100%", height: "100%" }
						}
					}
				}
			}
		},
		learning: {
			null: {
				"Home": {
					views: {
						0: {
							"ModelsView": {
								left: "0%", top: "0%", width: "100%", height: "100%", sections: {
									"translate:ModelDashBoard.Learning.LabelPublicModules": published("learning"),
									// ==> DISABLED: ModelIt
									// "translate:ModelDashBoard.Learning.LabelMyLearning": { source: (e, u) => e.map(e => ({ ref: e, w: u.workspace[e.top.id] })).filter(e => e.w && !e.w.id && e.w.id > 0).sortBy(e => (e.ref.top.userId == u.id ? e.ref.updated : e.w)).reverse().map(e => e.ref), user: true, refs: true },
									// 'translate:ModelDashBoardLearningLabelCourses': {
									// 	el: Course,
									// 	user: true,
									// }
								}
							},
						}
					}
				},
				"Access": {
					views: {
						0: {
							"LearningAccess": { left: "0%", top: "0%", width: "100%", height: "100%" }
						}
					}
				},
				"Insights": {
					views: {
						0: {
							"LearningInsightsContainer": { left: "0%", top: "0%", width: "100%", height: "100%" }
						}
					}
				}
			}
		}
	}
})();