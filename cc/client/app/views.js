export default {
		"": {
				"ModelsView": { name: "Model Catalog", type: "master", minWidth: 300 },
				"AccountUpgradeView": {name: "Account Upgrade", type: "master", minWidth: 300},
				"ModelView": { name: "Model Detail", type: "master" },
				"HelpView": { name: "Help", type: "master" },
				"ModelErrView": { name: "" },
				"LearningAccess": {name: "Learning Access"},
				"LearningInsights": {name: "Learning Insights"},
				"LearningInsightsContainer": {name: "Insights"}
		},
		"Model:boolean": {
				"InternalComponentsView": { name: "Internal Components", modelType: "boolean" },
				"ExternalComponentsView": { name: "External Components", modelType: "boolean" },
				"RegulationCenterView(Biologic)": { name: "Regulatory Mechanism", modelType: "boolean", minWidth: 245 },
				"RegulationCenterView(Compressed)": { name: "Regulatory Mechanism Compressed", modelType: "boolean", minWidth: 245, domains: ["learning", "research"]  },
				"RegulationExpressionView": { name: "Regulation Expression", modelType: "boolean", domains: ["learning", "research"] },
				"InteractionsView": { name: "Interaction Properties", modelType: "boolean", domains: ["learning", "research"]  },
				"ModelGraphView": { name: "Graph", modelType: "boolean", description: "ModelGraphViewDescription" },
				"ComponentGraphView": { name: "Component Graph", modelType: "boolean", description: "ComponentGraphViewDescription", domains: ["learning", "research"]  },
				"DominanceGraphView": { name: "Dominance Graph", modelType: "boolean", description: "DominanceGraphViewDescription", domains: ["learning", "research"]  },
				"ModelVersionGraphView": { name: "Model Versions Graph", modelType: "boolean", type: "separate", domains: ["learning", "research"]  }
		},
		"Model:metabolic": {
				"MetabolicGraphView" : { name: "Graph", modelType: "metabolic" },
				"MetabolitesView": { name: "Metabolites", modelType: "metabolic" },
				"ReactionsView": { name: "Reactions", modelType: "metabolic" },
				"ReactionView": { name: "Reaction", modelType: "metabolic" },
				"MetabolicKnowledgeBaseView": { name: "Knowledge Base", modelType: "metabolic" },
				"RegulationExpressionView": { name: "Regulation Expression", modelType: "metabolic" }
		},
		"Model:kinetic": {
			"KineticGraphView" : { name: "Graph", modelType: "kinetic" },
			"KineticSpeciesView": { name: "Species", modelType: "kinetic" },
			"KineticReactionsView": { name: "Reactions", modelType: "kinetic" },
			"KineticLawView": { name: "Kinetic Law", modelType: "kinetic" },
			"KineticKnowledgeBaseView": { name: "Knowledge Base", modelType: "kinetic" },
	},
	"Model:pharmacokinetic": {
		"PharmacoKineticGraphView": { name: "Graph", modelType: "pharmacokinetic" },
		"PharmacoKineticParametersView": { name: "Parameter", modelType: "pharmacokinetic" },
		"PharmacoKineticParametersSetupView": { name: "Parameter Setup", modelType: "pharmacokinetic" },
		"PharmacoKineticPopulationView": { name: "Population: Reference", modelType: "pharmacokinetic" },
		"PharmacoKineticCompartmentView": { name: "Compartment Control", modelType: "pharmacokinetic" },
		"PharmacoKineticDosingRegimeView": { name: "Dosing Regime", modelType: "pharmacokinetic" },
	},
	"Simulation": {
		"SimulationControlView": { name: "Simulation Control", minWidth: 260, modelType: "boolean" },
		"SimulationInternalComponentsView": { name: "Internal Components", modelType: "boolean" },
		"SimulationExternalComponentsView": { name: "External Components", modelType: "boolean" },
		"SimulationGraphView": { name: "Simulation Graph", modelType: "boolean" },
		"SimulationNetAbsoluteView": { name: "Activity Network", modelType: "boolean" },
		"SimulationNetVarianceView": { name: "Activity Network Variance", modelType: "boolean", domains: ["learning", "research"] },
		"SimulationNetClusteredView": { name: "Activity Network Clustered", modelType: "boolean", domains: ["learning", "research"] },
	},
	"Simulation:pharmacokinetic": {
		"PharmacoKineticSimulationControl": { name: "Simulation Control", minWidth: 260, modelType: "pharmacokinetic" },
		"PharmacoKineticDisplayedCompartments": { name: "Displayed Compartments", modelType: "pharmacokinetic" },
		"PharmacoKineticProfileComparison": { name: "Pharmacokinetic profiles: Central_CONC", modelType: "pharmacokinetic" },
		"PharmacoKineticExposureProfile": { name: "Pharmacokinetic profiles: Central_CONC", modelType: "pharmacokinetic" },
		// "SimulationGraphView": { name: "Exposure profile: Central_CONC", modelType: "pharmacokinetic"},
	},
	"Analysis:metabolic": {
		"DrugList": { name: "Drug List and Results", modelType: "metabolic" },
		"MetabolicExperimentsView": { name: "Experiment", modelType: "metabolic" },
		"FVAMetabolicExperimentsView": { name: "Experiment", modelType: "metabolic" },
		"FluxControlView": { name: "Flux Control", modelType: "metabolic" },
		"GeneControlView": { name: "Gene Control", modelType: "metabolic" },
		"ExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
		"FVAExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
		"ExperimentUploadSettingsView": { name: "Experiment Settings", modelType: "metabolic"},
		"ActivityGraphVarianceView": { name: "Activity Graph Variance", modelType: "metabolic" },
		"ReactionFluxView": { name: "Results", modelType: "metabolic" },
		"FluxCouplingResultsView": { name: "Flux Coupling Result", modelType: "metabolic" },
		"FluxVariabilityResultsView": { name: "Flux Variability Result", modelType: "metabolic" },
		"LethalGeneView": { name: "Lethal Gene", modelType: "metabolic" },
		"LethalReactionView": { name: "Lethal Reaction", modelType: "metabolic" },
		"EssentialGeneView": { name: "Essential Gene", modelType: "metabolic" },
		"EssentialReactionView": { name: "Essential Reaction", modelType: "metabolic" },
	},
	"Analysis:kinetic": {
		"KineticExperimentView": { name: "Experiment", modelType: "kinetic" },
		"KineticExperimentSettingView": { name: "Experiment Setting", modelType: "kinetic" },
		"KineticAnalysisReactionsView": { name: "Reactions", modelType: "kinetic" },
		"KineticAnalysisParametersView": { name: "Parameters", modelType: "kinetic" },
		"KineticAnalysisSpeciesView": { name: "Species", modelType: "kinetic" },
		"KineticActivityRelationshipView": { name: "Species Concentration", modelType: "kinetic" },
	},
	"Analysis:pharmacokinetic": {
		"PharmacoKineticSimulationControl": { name: "Simulation Control", modelType: "pharmacokinetic" },
		"PharmacoKineticDisplayedCompartments": { name: "Displayed Compartments", modelType: "pharmacokinetic" },
		"PharmacoKineticVirtualTrials": { name: "Virtual Trials", modelType: "pharmacokinetic" },
		"PharmacoKineticProfileComparison": { name: "Profile Comparison", modelType: "pharmacokinetic" },
		"PharmacoKineticProfileComparison2": { name: "Profile Comparison 2", modelType: "pharmacokinetic" },
		"PharmacoKineticExposureProfile": { name: "Exposure Profile", modelType: "pharmacokinetic" },
		"PharmacoKineticObservation": { name: "Observation", modelType: "pharmacokinetic" },
		"PharmacoKineticParameterSummaryPrimaryGraph": { name: "Simulated PK parameters", modelType: "pharmacokinetic" },
		"PharmacoKineticParameterSummarySecondaryGraph": { name: "Simulated secondary PK parameters", modelType: "pharmacokinetic" },
		"PharmacoKineticParameterSummaryParameterTable": { name: "Statistical summary of PK parameters", modelType: "pharmacokinetic" },
		"PharmacoKineticParametersViewAn": { name: "Parameter", modelType: "pharmacokinetic" },
	},
	"Gene Regulation": {
		"GeneRegulationGraphView": { name: "Graph", modelType: "metabolic" },
		"GenesView": { name: "Genes", modelType: "metabolic" },
		"ReactionsView": { name: "Reactions", modelType: "metabolic" },
		"RegulatoryMechanismView": { name: "Regulatory Mechanism", modelType: "metabolic" },
		"MetabolicKnowledgeBaseView": { name: "Knowledge Base", modelType: "metabolic" }
	},
	"Objective Function": {
		"ObjectiveFunctionsView": { name: "Objective Functions", modelType: "metabolic" },
		"ObjectiveFunctionBuilderView": { name: "Objective Function Builder", modelType: "metabolic" },
		"ObjectiveFunctionsReactionsView": { name: "Reactions", modelType: "metabolic" },
		"MetabolicKnowledgeBaseView": { name: "Knowledge Base", modelType: "metabolic" }
	},
	"Analysis": {
		"ExperimentsView": { name: "Experiments", modelType: "boolean", domains: ["learning", "research"] },
		"ExperimentView": { name: "Experiment Settings", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
		"ExperimentExternalComponentsView": { name: "External Components", modelType: "boolean", domains: ["learning", "research"] },
		"ExperimentInternalComponentsView": { name: "Internal Components", modelType: "boolean", domains: ["learning", "research"] },
		"AnalysisComponentsView": { name: "Graph Components", modelType: "boolean", domains: ["learning", "research"] },
		"AnalysisGraphView": { name: "Activity Relationships Graph", modelType: "boolean", domains: ["learning", "research"] },
		"ComponentSensitivity": { name: "Component Sensitivity", modelType: "boolean", domains: ["learning", "research"] },
		"EnvironmentSensitivity": { name: "Environment Sensitivity", modelType: "boolean", domains: ["learning", "research"] },
		// "AutomatedSimulationViewExperimentSetting": { name: "Experiment Settings", modelType: "boolean", domains: ["learning", "research"]},
	},
	"Sensitivity": {
		"ExperimentsSensitivityView": { name: "Experiments", modelType: "boolean", domains: ["learning", "research"] },
		"ExperimentSensitivityView": { name: "Experiment Settings", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
		"ExperimentSensitivityExternalComponentsView": { name: "External Components", modelType: "boolean", domains: ["learning", "research"] },
		"ExperimentSensitivityInternalComponentsView": { name: "Internal Components", modelType: "boolean", domains: ["learning", "research"] },
	},
	"Knowledge Base:boolean": {
		"PagesView": { name: "Components", modelType: "boolean", domains: ["learning", "research"] },
		"PageView": { name: "Knowledge Base", modelType: "boolean" },
		"ReferenceGraphView": { name: "Reference Graph", modelType: "boolean", domains: ["learning", "research"] },
	},
	"Knowledge Base:metabolic": {
		"KnowledgeBaseMetabolitesView": {
			modelType: "metabolic",
			name: "Metabolites"
		},
		"KnowledgeBaseReactionsView": {
			modelType: "metabolic",
			name: "Reactions"
		},
		"KnowledgeBaseGenesView": {
			modelType: "metabolic",
			name: "Genes"
		},
		"MetabolicKnowledgeBaseView": {
			modelType: "metabolic",
			name: "Knowledge Base"
		},
		"KnowledgeBaseMetabolicGraphView": {
			modelType: "metabolic",
			name: "Reference Graph"
		},
		"Analysis": {
			"ExperimentsView": { name: "Experiments", modelType: "boolean", domains: ["learning", "research"] },
			"ExperimentView": { name: "Experiment Settings", minWidth: 260, modelType: "boolean", domains: ["learning", "research"]},
			"ExperimentExternalComponentsView": { name: "External Components", modelType: "boolean", domains: ["learning", "research"]},
			"ExperimentInternalComponentsView": { name: "Internal Components", modelType: "boolean", domains: ["learning", "research"]},
			"AnalysisComponentsView": { name: "Graph Components", modelType: "boolean", domains: ["learning", "research"]},
			"AnalysisGraphView": { name: "Activity Relationships Graph", modelType: "boolean", domains: ["learning", "research"]},
			"ComponentSensitivity": { name: "Component Sensitivity", modelType: "boolean", domains: ["learning", "research"]},
			"EnvironmentSensitivity": { name: "Environment Sensitivity", modelType: "boolean", domains: ["learning", "research"]},
		},
		"Sensitivity": {
			"ExperimentsSensitivityView": { name: "Experiments", modelType: "boolean", domains: ["learning", "research"]},
			"ExperimentSensitivityView": { name: "Experiment Settings", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
			"ExperimentSensitivityExternalComponentsView": { name: "External Components", modelType: "boolean", domains: ["learning", "research"]},
			"ExperimentSensitivityInternalComponentsView": { name: "Internal Components", modelType: "boolean", domains: ["learning", "research"]},
		},
		"Knowledge Base": {
			"PagesView": { name: "Components", modelType: "boolean", domains: ["learning", "research"]},
			"PageView": { name: "Knowledge Base", modelType: "boolean"},
			"ReferenceGraphView": { name: "Reference Graph", modelType: "boolean", domains: ["learning", "research"]},
		},
		"Knowledge Base:metabolic": {
			"KnowledgeBaseMetabolitesView": {
				modelType: "metabolic",
				name: "Metabolites"
			},
			"KnowledgeBaseReactionsView": {
				modelType: "metabolic",
				name: "Reactions"
			},
			"KnowledgeBaseGenesView": {
				modelType: "metabolic",
				name: "Genes"
			},
			"MetabolicKnowledgeBaseView": {
				modelType: "metabolic",
				name: "Knowledge Base"
			},
			"KnowledgeBaseMetabolicGraphView": {
				modelType: "metabolic",
				name: "Reference Graph"
			}
		},
		"Knowledge Base:kinetic": {
			"KineticMetabolitesView": {
				modelType: "kinetic",
				name: "Species"
			},
			"KnowledgeBaseKineticReactionsView": {
				modelType: "kinetic",
				name: "Reactions"
			},
			"KineticKnowledgeBaseView": {
				modelType: "kinetic",
				name: "Knowledge Base"
			},
			"KnowledgeBaseKineticGraphView": {
				modelType: "kinetic",
				name: "Reference Graph"
			}
		},
		"Context Specific": {
			"GIMMEExperimentsView": { name: "Experiment", modelType: "metabolic" },
			"GIMMEExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
			"FastCoreExperimentsView": { name: "Experiment", modelType: "metabolic" },
			"FastCoreExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
			"iMATExperimentsView": { name: "Experiment", modelType: "metabolic" },
			"iMATExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
			"mCADREExperimentsView": { name: "Experiment", modelType: "metabolic" },
			"mCADREExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
			"iNITExperimentsView": { name: "Experiment", modelType: "metabolic" },
			"iNITExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
			"ContextSpecificGeneExpressionsView": { name: "Gene Expressions", modelType: "metabolic" },
			"CoreReactionsView": { name: "Core Reactions", modelType: "metabolic" }
		},
		"Sharing": {
			"SharingView": {name: "Share with Collaborators", domains: ["learning", "research"]},
			"LinksView": {name: "Shareable Links", domains: ["learning", "research"]},
			"PublishingView": { name: "Publish your Model", minWidth: 260, domains: ["learning", "research"] },
			"ExperimentsPublishingView": {name: "Experiments Publishing", domains: ["learning", "research"]}
		},
		"Topology": {
			"ClosenessView"   : {name: "Closeness Centrality", minWidth: 260,modelType:"boolean", domains: ["learning", "research"]},
			"ConnectivityView" : {name: "Connectivity Distribution", minWidth: 260,modelType:"boolean", domains: ["learning", "research"]},
			"TopologyView" : {name: "Topology", minWidth: 200,modelType:"boolean", domains: ["learning", "research"]},
			"InDegreeView" : {name: "In-Degree Frequency", minWidth: 260,modelType:"boolean", domains: ["learning", "research"]},
			"OutDegreeView" : {name: "Out-Degree Frequency", minWidth: 260,modelType:"boolean", domains: ["learning", "research"]}
		},
		"Feedback Loops" : {
			"FeedbackLoopTableView" : {name: "Feedback Loops List", minWidth: 260,modelType:"boolean", domains: ["learning", "research"]},
			"FeedbackLoopGraphView" : {name: "Feedback Graph View", minWidth: 260,modelType:"boolean", domains: ["learning", "research"]},
		},
		"State Space Analysis" : {
			"StateTransitionGraphView" : {name : "State Transition Graph", minWidth: 260, modelType:"boolean", domains: ["learning", "research"]},
			"SteadyStateView" : {name : "Steady State", minWidth: 260,modelType:"boolean", domains: ["learning", "research"]},
			"SteadyStateInternalComponentsView" : {name : "Internal Components", minWidth: 260,modelType:"boolean", domains: ["learning", "research"]}
		},
		"Description": {
			"DescriptionView": {name: "Description", domains: ["learning", "research"]},
			"ReferencesView": {name: "References", domains: ["learning", "research"]},
			"DocumentsView": { name: "Documents", minWidth: 280, domains: ["learning", "research"] }
		},
		"Learning": {
			"LearningView": { name: "Overview", domains: ["learning", "research"] },
			"LearningDocumentsView": { name: "Supporting Materials", domains: ["learning", "research"] },
			"LearningPropertiesView": { name: "Image", domains: ["learning", "research"] },
			"LearningObjectiveView": {name: "Learning Objectives", domains: ["learning", "research"]},
			"LearningReferencesView": {name: "References", domains: ["learning", "research"]},
			"StartButtonView": {name: "Start", domains: ["learning", "research"]}
		},
		"Content": {
			"SurveyView": { name: "Text Editor", minWidth: 350, domains: ["learning", "teaching"] },
			"TextView" : { name : "Editor", minWidth: 350, domains: ["learning"] },
			"ImageView" : { name: "Image", minWidth: 350, minHeight: 300, domains: ["learning", "teaching"] },
			"VideoView" : { name: "Video", minWidth: 350, minHeight: 300, domains: ["learning", "teaching"] },
			"SubmitButtonView" : { name: "Submit Button", domains: ["learning", "teaching"] },
			"DownloadButtonView": {name: "Download Button", domains: ["learning"]}
		}
	},
	"Knowledge Base:kinetic": {
		"KineticMetabolitesView": {
			modelType: "kinetic",
			name: "Species"
		},
		"KnowledgeBaseKineticReactionsView": {
			modelType: "kinetic",
			name: "Reactions"
		},
		"KineticKnowledgeBaseView": {
			modelType: "kinetic",
			name: "Knowledge Base"
		},
		"KnowledgeBaseKineticGraphView": {
			modelType: "kinetic",
			name: "Reference Graph"
		}
	},
	"Context Specific": {
		"GIMMEExperimentsView": { name: "Experiment", modelType: "metabolic" },
		"GIMMEExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
		"FastCoreExperimentsView": { name: "Experiment", modelType: "metabolic" },
		"FastCoreExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
		"iMATExperimentsView": { name: "Experiment", modelType: "metabolic" },
		"iMATExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
		"mCADREExperimentsView": { name: "Experiment", modelType: "metabolic" },
		"mCADREExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
		"iNITExperimentsView": { name: "Experiment", modelType: "metabolic" },
		"iNITExperimentSettingsView": { name: "Experiment Settings", modelType: "metabolic" },
		"ContextSpecificGeneExpressionsView": { name: "Gene Expressions", modelType: "metabolic" },
		"CoreReactionsView": { name: "Core Reactions", modelType: "metabolic" },
		"iMATModelCreationSettingsView": { name: "Model Creation Settings", modelType: "metabolic" },
		"iMATBoundaryReactionsView": { name: "Boundary Reactions", modelType: "metabolic" },
		"iMATCoreReactionsView": { name: "Core/Force Reactions", modelType: "metabolic" },
		"iMATExcludeReactionsView": { name: "Exclude Reactions", modelType: "metabolic" },
		"iMATButtonCreateModelView": { name: "Button Create Model", modelType: "metabolic" },
		"GIMMEModelCreationSettingsView": { name: "Model Creation Settings", modelType: "metabolic" },
		"GIMMEObjectiveFunctionsView": { name: "Objective Function", modelType: "metabolic" },
		"GIMMEBoundaryReactionsView": { name: "Boundary Reactions", modelType: "metabolic" },
		"GIMMECoreReactionsView": { name: "Core/Force Reactions", modelType: "metabolic" },
		"GIMMEExcludeReactionsView": { name: "Exclude Reactions", modelType: "metabolic" },
		"GIMMEButtonCreateModelView": { name: "Button Create Model", modelType: "metabolic" },
		"FastCoreModelCreationSettingsView": { name: "Model Creation Settings", modelType: "metabolic" },
		"FastCoreButtonCreateModelView": { name: "Button Create Model", modelType: "metabolic" },
	},
	"Sharing": {
		"SharingView": { name: "Share with Collaborators", domains: ["learning", "research"] },
		"LinksView": { name: "Shareable Links", domains: ["learning", "research"] },
		"PublishingView": { name: "Publish your Model", minWidth: 260, domains: ["learning", "research"] },
		"ExperimentsPublishingView": { name: "Experiments Publishing", domains: ["learning", "research"] }
	},
	"Topology": {
		"ClosenessView": { name: "Closeness Centrality", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
		"ConnectivityView": { name: "Connectivity Distribution", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
		"TopologyView": { name: "Topology", minWidth: 200, modelType: "boolean", domains: ["learning", "research"] },
		"InDegreeView": { name: "In-Degree Frequency", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
		"OutDegreeView": { name: "Out-Degree Frequency", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] }
	},
	"Feedback Loops": {
		"FeedbackLoopTableView": { name: "Feedback Loops List", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
		"FeedbackLoopGraphView": { name: "Feedback Graph View", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
	},
	"State Space Analysis": {
		"StateTransitionGraphView": { name: "State Transition Graph", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
		"SteadyStateView": { name: "Steady State", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] },
		"SteadyStateInternalComponentsView": { name: "Internal Components", minWidth: 260, modelType: "boolean", domains: ["learning", "research"] }
	},
	"Description": {
		"DescriptionView": { name: "Description", domains: ["learning", "research"] },
		"ReferencesView": { name: "References", domains: ["learning", "research"] },
		"DocumentsView": { name: "Documents", minWidth: 280, domains: ["learning", "research"] }
	},
	"Learning": {
		"LearningView": { name: "Overview", domains: ["learning", "research"] },
		"LearningDocumentsView": { name: "Supporting Materials", domains: ["learning", "research"] },
		"LearningPropertiesView": { name: "Image", domains: ["learning", "research"] },
		"LearningObjectiveView": { name: "Learning Objectives", domains: ["learning", "research"] },
		"LearningReferencesView": { name: "References", domains: ["learning", "research"] },
		"StartButtonView": { name: "Start", domains: ["learning", "research"] }
	},
	"Content": {
		"SurveyView": { name: "Text Editor", minWidth: 350, domains: ["learning", "teaching"] },
		"TextView" : { name : "Editor", minWidth: 350, domains: ["learning"] },
		"ImageView": { name: "Image", minWidth: 350, minHeight: 300, domains: ["learning", "teaching"] },
		"VideoView": { name: "Video", minWidth: 350, minHeight: 300, domains: ["learning", "teaching"] },
		"SubmitButtonView": { name: "Submit Button", domains: ["learning", "teaching"] },
		"DownloadButtonView": { name: "Download Button", domains: ["learning"] }
	}
		/*,
		"Debug": {
				"LoggerView": { name: "Logger", type: "separate" }
		}*/,
};
