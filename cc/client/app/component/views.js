import React from "react";
import { Seq } from 'immutable';
import Utils from "../utils";
import ModelsView from "./home/modelsView"

import Application from '../application';
import Add from '../action/add';
import Entity from '../entity/Entity';
import Remove from '../action/remove';

const entityMultiple = (k, n) => ({
	entity: (_, model, index) => Seq(model[k]).find(e => e.index == index),
	get: (_, model) => Seq(model[k]).sort(e => Math.abs(e.index)),
	add: (self, model) => {
		const index = Application.defIndex(model[k]);
		self.entityUpdate([new Add(new Entity[k]({
			name: Application.defName(model[k], n),
			index
		}))]);
		return index;
	},
	id: (entity) => entity.index,
	remove: (self, model, e, viewKey) => {
		self.entityUpdate([new Remove(e)]);
		self._layoutRemoveCustomPanelsFromLayout(viewKey, model, e);
		return Seq(model[k]).sort(e => Math.abs(e.index)).toIndexedSeq().filter(v => v === e).map((_, k) => k).first();
	},
	name: (e) => e.name,
});

const Conf = {
	HelpView: React.lazy(() => import("./help/helpView")),
	ModelsView: ModelsView, // React.lazy(() => import("./home/modelsView")),
	ModelView: React.lazy(() => import("./home/modelView")),
	ModelErrView: React.lazy(() => import("./err/modelErrView")),
	InternalComponentsView: React.lazy(() => import("./model/internalComponentsView")),
	ExternalComponentsView: React.lazy(() => import("./model/externalComponentsView")),
	RegulationCenterView: React.lazy(() => import("./model/regulationCenterView")),
	RegulationExpressionView: React.lazy(() => import("./model/regulationExpressionView")),
	InteractionsView: React.lazy(() => import("./model/interactionsView")),
	ModelGraphView: React.lazy(() => import("./model/modelGraphView")),
	ComponentGraphView: React.lazy(() => import("./model/componentGraphView")),
	DominanceGraphView: React.lazy(() => import("./model/dominanceGraphView")),
	ModelVersionGraphView: React.lazy(() => import("./model/modelVersionsGraphView")),
	SimulationControlView: React.lazy(() => import("./simulation/controlView")),
	SimulationInternalComponentsView: React.lazy(() => import("./simulation/internalComponentsView")),
	SimulationExternalComponentsView: React.lazy(() => import("./simulation/externalComponentsView")),
	SimulationGraphView: React.lazy(() => import("./simulation/graphView")),
	SimulationNetAbsoluteView: React.lazy(() => import("./simulation/networkAbsoluteView")),
	SimulationNetVarianceView: React.lazy(() => import("./simulation/networkVarianceView")),
	SimulationNetClusteredView: React.lazy(() => import("./simulation/networkClusteredView")),
	ComponentSensitivity: React.lazy(() => import("./analysis/environmentSensitivity/componentSensitivity")),
	EnvironmentSensitivity: React.lazy(() => import("./analysis/environmentSensitivity/environmentSensitivity")),
	ExperimentsView: React.lazy(() => import("./analysis/doseResponse/experimentsView")),
	ExperimentsSensitivityView: React.lazy(() => import("./analysis/environmentSensitivity/experimentsSensitivityView")),
	ExperimentView: React.lazy(() => import("./analysis/doseResponse/experimentView")),
	ExperimentSensitivityView: React.lazy(() => import("./analysis/environmentSensitivity/experimentSensitivityView")),
	ExperimentInternalComponentsView: React.lazy(() => import("./analysis/doseResponse/internalComponentsView")),
	ExperimentExternalComponentsView: React.lazy(() => import("./analysis/doseResponse/externalComponentsView")),
	ExperimentSensitivityInternalComponentsView: React.lazy(() => import("./analysis/environmentSensitivity/internalComponentsView")),
	ExperimentSensitivityExternalComponentsView: React.lazy(() => import("./analysis/environmentSensitivity/externalComponentsView")),
	// AutomatedSimulationViewExperimentSetting: React.lazy(() => import("./analysis/automatedSimulation/experimentsView")),
	AnalysisComponentsView: React.lazy(() => import("./analysis/componentsView")),
	AnalysisGraphView: React.lazy(() => import("./analysis/doseResponse/graphView")),
	PagesView: React.lazy(() => import("./knowledgeBase/pagesView")),
	PageView: React.lazy(() => import("./knowledgeBase/pageView")),
	ReferenceGraphView: React.lazy(() => import("./knowledgeBase/referenceGraphView")),
	SharingView: React.lazy(() => import("./sharing/sharingView")),
	LinksView: React.lazy(() => import("./sharing/linksView")),
	PublishingView: React.lazy(() => import("./sharing/publishingView")),
	ExperimentsPublishingView: React.lazy(() => import("./sharing/experimentsView")),
	DescriptionView: React.lazy(() => import("./description/descriptionView")),
	ReferencesView: React.lazy(() => import("./description/referencesView")),
	DocumentsView: React.lazy(() => import("./description/documentsView")),
	AccountUpgradeView: React.lazy(() => import("./learning/accountUpgrade")),
	LearningAccess: React.lazy(() => import("./learning/learningAccess")),
	LearningInsights: React.lazy(() => import("./learning/learningInsights")),
	LearningInsightsContainer: React.lazy(() => import("./learning/insightsContainer")),
	LearningView: React.lazy(() => import("./learning/learningView")),
	LearningDocumentsView: React.lazy(() => import("./learning/learningDocumentsView")),
	LearningPropertiesView: React.lazy(() => import("./learning/propertiesView")),
	LearningObjectiveView: React.lazy(() => import("./learning/learningObjectiveView")),
	LearningReferencesView: React.lazy(() => import("./learning/learningReferencesView")),
	StartButtonView: React.lazy(() => import("./learning/startButtonView")),
	SurveyView: {
		Component: React.lazy(() => import("./content/surveyView")),
		multiple: entityMultiple("Survey", "Text Editor ")
	},
	ImageView: {
		Component: React.lazy(() => import("./content/imageView")),
		multiple: entityMultiple("ImagePanel", "Image View ")
	},
	VideoView: {
		Component: React.lazy(() => import("./content/videoView")),
		multiple: entityMultiple("ImagePanel", "Video View ")
	},
	TextView: {
		Component: React.lazy(() => import("./content/textView")),
		multiple: entityMultiple("TextEditorPanel", "Text Editor ")
	},
	SubmitButtonView: React.lazy(() => import("./content/submitButtonView")),
	LoggerView: React.lazy(() => import("./debug/loggerView")),
	ClosenessView: React.lazy(() => import("./topology/closenessView")),
	ConnectivityView: React.lazy(() => import("./topology/connectivityView")),
	InDegreeView: React.lazy(() => import("./topology/inDegreeView")),
	OutDegreeView: React.lazy(() => import("./topology/outDegreeView")),
	TopologyView: React.lazy(() => import("./topology/topologyView")),
	FeedbackLoopTableView: React.lazy(() => import("./functionalCircuitAnalysis/feedbackLoopTableView")),
	FeedbackLoopGraphView: React.lazy(() => import("./functionalCircuitAnalysis/feedbackLoopGraphView")),
	FunctionalCircuitAnalysisView: React.lazy(() => import("./functionalCircuitAnalysis/functionalCircuitAnalysisView")),
	FunctionalCircuitView: React.lazy(() => import("./functionalCircuitAnalysis/functionalCircuitView")),
	StateTransitionGraphView: React.lazy(() => import("./stateSpace/stateTransitionGraphView")),
	SteadyStateInternalComponentsView: React.lazy(() => import("./stateSpace/steadyStateInternalComponentsView")),
	SteadyStateView: React.lazy(() => import("./stateSpace/steadyStateView")),

	/**
	 * DashBoard > (Metabolic) > Analysis
	 */
	MetabolicExperimentsView: React.lazy(() => import("./metabolic/Analysis/ExperimentsView")),
	FVAMetabolicExperimentsView: React.lazy(() => import("./metabolic/Analysis/FVA_ExperimentsView")),
	ExperimentSettingsView: React.lazy(() => import("./metabolic/Analysis/FBA_ExperimentSettingsView")),
	ExperimentUploadSettingsView: React.lazy(() => import("./metabolic/Analysis/DrugIdentification/FBA_DGE_ExperimentSettingsView")),
	DrugList: React.lazy(() => import("./metabolic/Analysis/DrugIdentification/DrugListView")),
	FVAExperimentSettingsView: React.lazy(() => import("./metabolic/Analysis/FVA_ExperimentSettingsView")),
	ReactionFluxView: React.lazy(() => import("./metabolic/Analysis/FluxBalanceAnalysis/ReactionFluxView")),
	FluxCouplingResultsView: React.lazy(() => import("./metabolic/Analysis/FCA/FluxCouplingResultsView")),
	FluxVariabilityResultsView: React.lazy(() => import("./metabolic/Analysis/FluxVarianceAnalysis/FluxVariabilityResultsView")),
	LethalGeneView: React.lazy(() => import("./metabolic/Analysis/SyntheticLethality/LethalGeneView")),
	LethalReactionView: React.lazy(() => import("./metabolic/Analysis/SyntheticLethality/LethalReactionView")),
	EssentialGeneView: React.lazy(() => import("./metabolic/Analysis/Essentiality/EssentialGeneView")),
	EssentialReactionView: React.lazy(() => import("./metabolic/Analysis/Essentiality/EssentialReactionView")),
	FluxControlView: React.lazy(() => import("./metabolic/Analysis/FluxControlView")),
	GeneControlView: React.lazy(() => import("./metabolic/Analysis/GeneControlView")),
	ActivityGraphVarianceView: React.lazy(() => import("./metabolic/Analysis/FluxBalanceAnalysis/ActivityGraphVarianceView")),

	/**
 * DashBoard > (Kinetic) > Analysis
 */
	KineticExperimentView: React.lazy(() => import("./kinetic/Analysis/ExperimentsView")),
	KineticExperimentSettingView: React.lazy(() => import("./kinetic/Analysis/ExperimentSettingsView")),
	KineticAnalysisReactionsView: React.lazy(() => import("./kinetic/Model/ReactionsView")),
	KineticAnalysisParametersView: React.lazy(() => import("./kinetic/Analysis/ParametersView")),
	KineticAnalysisSpeciesView: React.lazy(() => import("./kinetic/Analysis/SpeciesView")),
	KineticActivityRelationshipView: React.lazy(() => import("./kinetic/Analysis/ActivityRelationshipView")),
 
	/**
* DashBoard > (Pharmacokinetic) > Analysis
*/
	PharmacoKineticSimulationControl: React.lazy(() => import("./pharmacokinetic/Analysis/virtualClinicTrial/SimulationControlView")),
	PharmacoKineticVirtualTrials: React.lazy(() => import("./pharmacokinetic/Analysis/virtualClinicTrial/VirtualTrials")),
	PharmacoKineticProfileComparison: React.lazy(() => import("./pharmacokinetic/Analysis/virtualClinicTrial/ProfileComparison")),
	PharmacoKineticProfileComparison2: React.lazy(() => import("./pharmacokinetic/Analysis/virtualClinicTrial/ProfileComparison2")),
	PharmacoKineticExposureProfile: React.lazy(() => import("./pharmacokinetic/Analysis/virtualClinicTrial/ExposureProfile")),
	PharmacoKineticObservation: React.lazy(() => import("./pharmacokinetic/Analysis/parameterSensitivity/Observation")),
	PharmacoKineticParametersViewAn: React.lazy(() => import("./pharmacokinetic/Analysis/parameterSensitivity/ParametersView")),
	PharmacoKineticParameterSummaryPrimaryGraph: React.lazy(() => import("./pharmacokinetic/Analysis/parameterSummary/PKPrimary")),
	PharmacoKineticParameterSummarySecondaryGraph: React.lazy(() => import("./pharmacokinetic/Analysis/parameterSummary/PKSecondary")),
	PharmacoKineticParameterSummaryParameterTable: React.lazy(() => import("./pharmacokinetic/Analysis/parameterSummary/PKTable")),

	/**
	 * DashBoard > (Metabolic) > Model
	 */
	MetabolicGraphView: React.lazy(() => import("./metabolic/Model/GraphView")),
	MetabolitesView: React.lazy(() => import("./metabolic/Model/MetabolitesView")),
	ReactionsView: React.lazy(() => import("./metabolic/Model/ReactionsView")),
	ReactionView: React.lazy(() => import("./metabolic/Model/ReactionView")),

	/**
* DashBoard > (Kinetic) > Model
*/
	KineticGraphView: React.lazy(() => import("./kinetic/Model/GraphView")),
	KineticSpeciesView: React.lazy(() => import("./kinetic/Model/SpeciesView")),
	KineticReactionsView: React.lazy(() => import("./kinetic/Model/ReactionsView")),
	KineticLawView: React.lazy(() => import("./kinetic/Model/KineticLaw")),

	/**
	* DashBoard > (Pharmacokinetic) > Model
	*/
	PharmacoKineticGraphView: React.lazy(() => import("./pharmacokinetic/Model/GraphView")),
	PharmacoKineticParametersView: React.lazy(() => import("./pharmacokinetic/Model/ParametersView")),
	PharmacoKineticParametersSetupView: React.lazy(() => import("./pharmacokinetic/Model/ParametersSetup")),
	PharmacoKineticPopulationView: React.lazy(() => import("./pharmacokinetic/Model/Population")),
	PharmacoKineticCompartmentView: React.lazy(() => import("./pharmacokinetic/Model/CompartmentControl")),
	PharmacoKineticDosingRegimeView: React.lazy(() => import("./pharmacokinetic/Model/DosingRegime")),


	/**
	* DashBoard > (Pharmacokinetic) > Simulation
	*/
	PharmacoKineticDisplayedCompartments: React.lazy(() => import("./pharmacokinetic/Simulation/internalComponentsView")),


	/**
	 * DashBoard > (Metabolic) > Objective Function
	 */
	ObjectiveFunctionsView: React.lazy(() => import("./metabolic/ObjectiveFunction/ObjectiveFunctionsView")),
	ObjectiveFunctionBuilderView: React.lazy(() => import("./metabolic/ObjectiveFunction/ObjectiveFunctionBuilderView")),
	ObjectiveFunctionsReactionsView: React.lazy(() => import("./metabolic/ObjectiveFunction/ReactionsView")),

	/**
	 * DashBoard > (Metabolic) > Gene Regulation
	 */
	GenesView: React.lazy(() => import("./metabolic/GeneRegulation/GenesView")),
	GeneRegulationGraphView: React.lazy(() => import("./metabolic/GeneRegulation/GraphView")),
	RegulatoryMechanismView: React.lazy(() => import("./metabolic/GeneRegulation/RegulatoryMechanismView")),

	/**
	 * DashBoard > (Metabolic) > Knowledge Base
	 */
	KnowledgeBaseMetabolitesView: React.lazy(() => import("./metabolic/KnowledgeBase/MetabolitesView")),
	KnowledgeBaseReactionsView: React.lazy(() => import("./metabolic/KnowledgeBase/ReactionsView")),
	KnowledgeBaseGenesView: React.lazy(() => import("./metabolic/KnowledgeBase/GenesView")),
	MetabolicKnowledgeBaseView: React.lazy(() => import("./metabolic/KnowledgeBase")),
	KnowledgeBaseMetabolicGraphView: React.lazy(() => import("./metabolic/KnowledgeBase/GraphView")),

	/**
	 * DashBoard > (Kinetic) > Knowledge Base
	 */
	KineticMetabolitesView: React.lazy(() => import("./kinetic/KnowledgeBase/MetabolitesView")),
	KnowledgeBaseKineticReactionsView: React.lazy(() => import("./kinetic/KnowledgeBase/ReactionsView")),
	KineticKnowledgeBaseView: React.lazy(() => import("./kinetic/KnowledgeBase")),
	KnowledgeBaseKineticGraphView: React.lazy(() => import("./kinetic/KnowledgeBase/GraphView")),

	/**
	 * DashBoard > (Metabolic) > Knowledge Base
	 */
	// ContextSpecificExperimentsView: React.lazy(() => import("./metabolic/ContextSpecific/ExperimentsView")),
	GIMMEExperimentSettingsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/GIMME/ExperimentSettingsView")),
	iMATExperimentSettingsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/iMAT/ExperimentSettingsView")),
	FastCoreExperimentSettingsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/FastCore/ExperimentSettingsView")),
	mCADREExperimentSettingsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/mCADRE/ExperimentSettingsView")),
	iNITExperimentSettingsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/iNIT/ExperimentSettingsView")),
	ContextSpecificGeneExpressionsView: React.lazy(() => import("./metabolic/ContextSpecific/GeneExpressionsView")),
	CoreReactionsView: React.lazy(() => import("./metabolic/ContextSpecific/CoreReactionsView")),

	GIMMEExperimentsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/GIMME/ExperimentsView")),
	iMATExperimentsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/iMAT/ExperimentsView")),
	FastCoreExperimentsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/FastCore/ExperimentsView")),
	mCADREExperimentsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/mCADRE/ExperimentsView")),
	iNITExperimentsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/iNIT/ExperimentsView")),
	iMATModelCreationSettingsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/iMAT/ModelCreationSettingsView")),
	iMATBoundaryReactionsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/iMAT/BoundaryReactionsView")),
	iMATCoreReactionsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/iMAT/CoreReactionsView")),
	iMATExcludeReactionsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/iMAT/ExcludeReactionsView")),
	iMATButtonCreateModelView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/iMAT/ButtonCreateModelView")),

	GIMMEModelCreationSettingsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/GIMME/ModelCreationSettingsView")),
	GIMMEObjectiveFunctionsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/GIMME/ObjectiveFunctionsView")),
	GIMMEBoundaryReactionsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/GIMME/BoundaryReactionsView")),
	GIMMECoreReactionsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/GIMME/CoreReactionsView")),
	GIMMEExcludeReactionsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/GIMME/ExcludeReactionsView")),
	GIMMEButtonCreateModelView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/GIMME/ButtonCreateModelView")),
	
	FastCoreModelCreationSettingsView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/FastCore/ModelCreationSettingsView")),
	FastCoreButtonCreateModelView: React.lazy(() => import("./metabolic/ContextSpecific/Analysis/FastCore/ButtonCreateModelView")),
};

export default Seq(Conf).map(Utils.ext.bind(null, "Component")).map(({ Component, multiple }) => ({
	multiple,
	Component
})).toObject();
