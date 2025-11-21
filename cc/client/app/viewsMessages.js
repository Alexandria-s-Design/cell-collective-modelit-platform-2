import Views from "./views";
import { defineMessages } from "react-intl";


// The script below generates defineMessage object for all Views
// TODO: Make a hook, maybe?
// sadly react-intl doesn't dynamically load message

const prefix = "ModelDashBoard.Views"
const getViewMessageKey = s => `${prefix.replace(/\./g, "")}${s}`.replace(" ", "")
const translate = () => {
   
}
// const getViewMessageID = s => `${prefix}.${s}`

// const p = getViewMessageKey

// const messages = Object.keys(Views).reduce((o, k) => k && ({ ...o, [p(k)]: { id: p2(k), defaultMessage: k }}), { })
// // const

// const messages2 = Object.keys(Views).reduce((o, k) => 
//     ({ ...o, ...Object.keys(Views[k]).reduce((o2, k2) => ({ ...o2, [p(k2)]: { id: p2(k2), defaultMessage: Views[k][k2].name ? Views[k][k2].name : Views[k][k2] } }), { }) })
// , { })

export { getViewMessageKey };
export default defineMessages({
   ModelDashBoardViewsMetabolitesView:
    { id: 'ModelDashBoard.Views.MetabolitesView', defaultMessage: 'Metabolites' },
   ModelDashBoardViewsReactionsView:
    { id: 'ModelDashBoard.Views.ReactionsView', defaultMessage: 'Reactions' },
    ModelDashBoardViewsMetabolicGraphView:
    { id: 'ModelDashBoard.Views.MetabolicGraphView', defaultMessage: 'Graph' },
    ModelDashBoardViewsReactionView:
    { id: 'ModelDashBoard.Views.ReactionView', defaultMessage: 'Reaction' },
		ModelDashBoardViewsGenesView:
		{ id: 'ModelDashBoard.Views.GenesView', defaultMessage: 'Genes' },
		ModelDashBoardViewsRegulatoryMechanismView:
    { id: 'ModelDashBoard.Views.RegulatoryMechanismView', defaultMessage: 'Regulatory Mechanism' },
    ModelDashBoardViewsMetabolicExperimentView:
    { id: 'ModelDashBoard.Views.MetabolicExperimentView', defaultMessage: 'Experiment' },
    ModelDashBoardViewsFluxControlView:
    { id: 'ModelDashBoard.Views.FluxControlView', defaultMessage: 'Flux Control' },
    ModelDashBoardViewsGeneControlView:
    { id: 'ModelDashBoard.Views.GeneControlView', defaultMessage: 'Gene Control' },
    ModelDashBoardViewsNewExperimentView:
    { id: 'ModelDashBoard.Views.NewExperimentView', defaultMessage: 'New Experiment' },
    ModelDashBoardViewsActivityGraphVarianceView:
    { id: 'ModelDashBoard.Views.ActivityGraphVarianceView', defaultMessage: 'Activity Graph Variance' },
    ModelDashBoardViewsResultsView:
    { id: 'ModelDashBoard.Views.ResultsView', defaultMessage: 'Result View' },
    ModelDashBoardViewsFluxCouplingResultsView:
    { id: 'ModelDashBoard.Views.FluxCouplingResultsView', defaultMessage: 'Flux Coupling Result' },
    ModelDashBoardViewsFluxVariabilityResultsView:
    { id: 'ModelDashBoard.Views.FluxVariabilityResultsView', defaultMessage: 'Flux Variability Result' },
    ModelDashBoardViewsLethalGeneView:
    { id: 'ModelDashBoard.Views.LethalGeneView', defaultMessage: 'Lethal Gene' },
    ModelDashBoardViewsLethalReactionView:
    { id: 'ModelDashBoard.Views.LethalReactionView', defaultMessage: 'Lethal Reaction' },
    ModelDashBoardViewsEssentialGeneView:
    { id: 'ModelDashBoard.Views.EssentialGeneView', defaultMessage: 'Essential Gene' },
    ModelDashBoardViewsEssentialReactionView:
    { id: 'ModelDashBoard.Views.EssentialReactionView', defaultMessage: 'New Experiment' },
    ModelDashBoardViewsKnowledgeBaseView:
    { id: 'ModelDashBoard.Views.KnowledgeBaseView', defaultMessage: 'Knowledge Base' },
    ModelDashBoardViewsModel:
    { id: 'ModelDashBoard.Views.Model', defaultMessage: 'Model' },
   ModelDashBoardViewsSimulation:
    { id: 'ModelDashBoard.Views.Simulation',
      defaultMessage: 'Simulation' },
   ModelDashBoardViewsAnalysis:
    { id: 'ModelDashBoard.Views.Analysis',
      defaultMessage: 'Analysis' },
   ModelDashBoardViewsSensitivity:
    { id: 'ModelDashBoard.Views.Sensitivity',
      defaultMessage: 'Sensitivity' },
   ModelDashBoardViewsKnowledgeBase:
    { id: 'ModelDashBoard.Views.Knowledge Base',
      defaultMessage: 'Knowledge Base' },
   ModelDashBoardViewsSharing:
    { id: 'ModelDashBoard.Views.Sharing',
      defaultMessage: 'Sharing' },
   ModelDashBoardViewsTopology:
    { id: 'ModelDashBoard.Views.Topology',
      defaultMessage: 'Topology' },
   ModelDashBoardViewsFeedbackLoops:
    { id: 'ModelDashBoard.Views.Feedback Loops',
      defaultMessage: 'Feedback Loops' },
   'ModelDashBoardViewsStateSpace Analysis':
    { id: 'ModelDashBoard.Views.State Space Analysis',
      defaultMessage: 'State Space Analysis' },
   ModelDashBoardViewsDescription:
    { id: 'ModelDashBoard.Views.Description',
      defaultMessage: 'Description' },
   ModelDashBoardViewsLearning:
    { id: 'ModelDashBoard.Views.Learning',
      defaultMessage: 'Learning' },
   ModelDashBoardViewsContent:
    { id: 'ModelDashBoard.Views.Content',
      defaultMessage: 'Content' },
   ModelDashBoardViewsDebug:
    { id: 'ModelDashBoard.Views.Debug', defaultMessage: 'Debug' },
   ModelDashBoardViewsModelsView:
    { id: 'ModelDashBoard.Views.ModelsView',
      defaultMessage: 'Model Catalog' },
   ModelDashBoardViewsModelView:
    { id: 'ModelDashBoard.Views.ModelView',
      defaultMessage: 'Model Detail' },
   ModelDashBoardViewsHelpView:
    { id: 'ModelDashBoard.Views.HelpView', defaultMessage: 'Help' },
   ModelDashBoardViewsLearningAccess:
    { id: 'ModelDashBoard.Views.LearningAccess',
      defaultMessage: 'Learning Access' },
   ModelDashBoardViewsLearningInsights:
    { id: 'ModelDashBoard.Views.LearningInsights',
      defaultMessage: 'Learning Insights' },
   ModelDashBoardViewsInternalComponentsView:
    { id: 'ModelDashBoard.Views.InternalComponentsView',
      defaultMessage: 'Internal Components' },
   ModelDashBoardViewsExternalComponentsView:
    { id: 'ModelDashBoard.Views.ExternalComponentsView',
      defaultMessage: 'External Components' },
   'ModelDashBoardViewsRegulationCenterView(Biologic)':
    { id: 'ModelDashBoard.Views.RegulationCenterView(Biologic)',
      defaultMessage: 'Regulatory Mechanism' },
   'ModelDashBoardViewsRegulationCenterView(Compressed)':
    { id: 'ModelDashBoard.Views.RegulationCenterView(Compressed)',
      defaultMessage: 'Regulatory Mechanism Compressed' },
   ModelDashBoardViewsRegulationExpressionView:
    { id: 'ModelDashBoard.Views.RegulationExpressionView',
      defaultMessage: 'Regulation Expression' },
   ModelDashBoardViewsInteractionsView:
    { id: 'ModelDashBoard.Views.InteractionsView',
      defaultMessage: 'Interaction Properties' },
   ModelDashBoardViewsModelGraphView:
    { id: 'ModelDashBoard.Views.ModelGraphView',
      defaultMessage: 'Graph' },
   ModelDashBoardViewsComponentGraphView:
    { id: 'ModelDashBoard.Views.ComponentGraphView',
      defaultMessage: 'Component Graph' },
   ModelDashBoardViewsDominanceGraphView:
    { id: 'ModelDashBoard.Views.DominanceGraphView',
      defaultMessage: 'Dominance Graph' },
   ModelDashBoardViewsModelVersionGraphView:
    { id: 'ModelDashBoard.Views.ModelVersionGraphView',
      defaultMessage: 'Model Versions Graph' },
   ModelDashBoardViewsSimulationControlView:
    { id: 'ModelDashBoard.Views.SimulationControlView',
      defaultMessage: 'Simulation Control' },
   ModelDashBoardViewsSimulationInternalComponentsView:
    { id: 'ModelDashBoard.Views.SimulationInternalComponentsView',
      defaultMessage: 'Internal Components' },
   ModelDashBoardViewsSimulationExternalComponentsView:
    { id: 'ModelDashBoard.Views.SimulationExternalComponentsView',
      defaultMessage: 'External Components' },
   ModelDashBoardViewsSimulationGraphView:
    { id: 'ModelDashBoard.Views.SimulationGraphView',
      defaultMessage: 'Simulation Graph' },
   ModelDashBoardViewsSimulationNetAbsoluteView:
    { id: 'ModelDashBoard.Views.SimulationNetAbsoluteView',
      defaultMessage: 'Activity Network' },
   ModelDashBoardViewsSimulationNetVarianceView:
    { id: 'ModelDashBoard.Views.SimulationNetVarianceView',
      defaultMessage: 'Activity Network Variance' },
   ModelDashBoardViewsSimulationNetClusteredView:
    { id: 'ModelDashBoard.Views.SimulationNetClusteredView',
      defaultMessage: 'Activity Network Clustered' },
   ModelDashBoardViewsExperimentsView:
    { id: 'ModelDashBoard.Views.ExperimentsView',
      defaultMessage: 'Experiments' },
   ModelDashBoardViewsExperimentView:
    { id: 'ModelDashBoard.Views.ExperimentView',
      defaultMessage: 'Experiment Settings' },
   ModelDashBoardViewsExperimentExternalComponentsView:
    { id: 'ModelDashBoard.Views.ExperimentExternalComponentsView',
      defaultMessage: 'External Components' },
   ModelDashBoardViewsExperimentInternalComponentsView:
    { id: 'ModelDashBoard.Views.ExperimentInternalComponentsView',
      defaultMessage: 'Internal Components' },
   ModelDashBoardViewsAnalysisComponentsView:
    { id: 'ModelDashBoard.Views.AnalysisComponentsView',
      defaultMessage: 'Graph Components' },
   ModelDashBoardViewsAnalysisGraphView:
    { id: 'ModelDashBoard.Views.AnalysisGraphView',
      defaultMessage: 'Activity Relationships Graph' },
   ModelDashBoardViewsComponentSensitivity:
    { id: 'ModelDashBoard.Views.ComponentSensitivity',
      defaultMessage: 'Component Sensitivity' },
   ModelDashBoardViewsEnvironmentSensitivity:
    { id: 'ModelDashBoard.Views.EnvironmentSensitivity',
      defaultMessage: 'Environment Sensitivity' },
   ModelDashBoardViewsExperimentsSensitivityView:
    { id: 'ModelDashBoard.Views.ExperimentsSensitivityView',
      defaultMessage: 'Experiments' },
   ModelDashBoardViewsExperimentSensitivityView:
    { id: 'ModelDashBoard.Views.ExperimentSensitivityView',
      defaultMessage: 'Experiment Settings' },
   ModelDashBoardViewsExperimentSensitivityExternalComponentsView:
    { id:
       'ModelDashBoard.Views.ExperimentSensitivityExternalComponentsView',
      defaultMessage: 'External Components' },
   ModelDashBoardViewsExperimentSensitivityInternalComponentsView:
    { id:
       'ModelDashBoard.Views.ExperimentSensitivityInternalComponentsView',
      defaultMessage: 'Internal Components' },
   ModelDashBoardViewsPagesView:
    { id: 'ModelDashBoard.Views.PagesView',
      defaultMessage: 'Components' },
   ModelDashBoardViewsPageView:
    { id: 'ModelDashBoard.Views.PageView',
      defaultMessage: 'Knowledge Base' },
   ModelDashBoardViewsReferenceGraphView:
    { id: 'ModelDashBoard.Views.ReferenceGraphView',
      defaultMessage: 'Reference Graph' },
   ModelDashBoardViewsSharingView:
    { id: 'ModelDashBoard.Views.SharingView',
      defaultMessage: 'Share with Collaborators' },
   ModelDashBoardViewsLinksView:
    { id: 'ModelDashBoard.Views.LinksView',
      defaultMessage: 'Shareable Links' },
   ModelDashBoardViewsPublishingView:
    { id: 'ModelDashBoard.Views.PublishingView',
      defaultMessage: 'Publish your Model' },
   ModelDashBoardViewsExperimentsPublishingView:
    { id: 'ModelDashBoard.Views.ExperimentsPublishingView',
      defaultMessage: 'Experiments Publishing' },
   ModelDashBoardViewsClosenessView:
    { id: 'ModelDashBoard.Views.ClosenessView',
      defaultMessage: 'Closeness Centrality' },
   ModelDashBoardViewsConnectivityView:
    { id: 'ModelDashBoard.Views.ConnectivityView',
      defaultMessage: 'Connectivity Distribution' },
   ModelDashBoardViewsTopologyView:
    { id: 'ModelDashBoard.Views.TopologyView',
      defaultMessage: 'Topology' },
   ModelDashBoardViewsInDegreeView:
    { id: 'ModelDashBoard.Views.InDegreeView',
      defaultMessage: 'In-Degree Frequency' },
   ModelDashBoardViewsOutDegreeView:
    { id: 'ModelDashBoard.Views.OutDegreeView',
      defaultMessage: 'Out-Degree Frequency' },
   ModelDashBoardViewsFeedbackLoopTableView:
    { id: 'ModelDashBoard.Views.FeedbackLoopTableView',
      defaultMessage: 'Feedback Loops List' },
   ModelDashBoardViewsFeedbackLoopGraphView:
    { id: 'ModelDashBoard.Views.FeedbackLoopGraphView',
      defaultMessage: 'Feedback Graph View' },
   ModelDashBoardViewsStateTransitionGraphView:
    { id: 'ModelDashBoard.Views.StateTransitionGraphView',
      defaultMessage: 'State Transition Graph' },
   ModelDashBoardViewsSteadyStateView:
    { id: 'ModelDashBoard.Views.SteadyStateView',
      defaultMessage: 'Steady State' },
   ModelDashBoardViewsSteadyStateInternalComponentsView:
    { id: 'ModelDashBoard.Views.SteadyStateInternalComponentsView',
      defaultMessage: 'Internal Components' },
   ModelDashBoardViewsDescriptionView:
    { id: 'ModelDashBoard.Views.DescriptionView',
      defaultMessage: 'Description' },
   ModelDashBoardViewsReferencesView:
    { id: 'ModelDashBoard.Views.ReferencesView',
      defaultMessage: 'References' },
   ModelDashBoardViewsDocumentsView:
    { id: 'ModelDashBoard.Views.DocumentsView',
      defaultMessage: 'Documents' },
   ModelDashBoardViewsLearningView:
    { id: 'ModelDashBoard.Views.LearningView',
      defaultMessage: 'Overview' },
   ModelDashBoardViewsSurveyView:
    { id: 'ModelDashBoard.Views.SurveyView',
      defaultMessage: 'Survey' },
   ModelDashBoardViewsTextView:
    { id: 'ModelDashBoard.Views.TextView',
      defaultMessage: 'Editor' },
   ModelDashBoardViewsImageView:
    { id: 'ModelDashBoard.Views.ImageView',
      defaultMessage: 'Image' },
			ModelDashBoardViewsVideoView:
			{ id: 'ModelDashBoard.Views.VideoView',
				defaultMessage: 'Video' },
   ModelDashBoardViewsLoggerView:
    { id: 'ModelDashBoard.Views.LoggerView',
      defaultMessage: 'Logger' },
   ModelDashBoardViewsStartButtonView:
   { id: 'ModelDashboard.Views.StartButtonView',
      defaultMessage: 'Start' },
   ModelDashBoardViewsLearningReferencesView:
   { id: 'ModelDashBoard.Views.LearningReferencesView',
      defaultMessage: 'References' },
   ModelDashBoardViewsLearningObjectiveView:
   { id: 'ModelDashBoard.Views.LearningObjectiveView',
      defaultMessage: 'Learning Objectives' },
   ModelDashBoardViewsLearningPropertiesView:
   { id: 'ModelDashBoard.Views.LearningPropertiesView',
      defaultMessage: 'Image' },
   ModelDashBoardViewsLearningDocumentsView:
   { id: 'ModelDashBoard.Views.LearningDocumentsView',
      defaultMessage: 'Supporting Materials' },
   ModelDashBoardViewsDominanceGraphViewDescription:
   { id: 'ModelDashBoard.Views.DominanceGraphViewDescription',
      defaultMessage: "Displays dominance graph for given component using green nodes for positive and red nodes for negative regulators. Edge between given negative and positive regulator means that this negative regulator is dominant over that positive one."},
   ModelDashBoardViewsComponentGraphViewDescription:
   { id: 'ModelDashBoard.Views.ComponentGraphViewDescription',
      defaultMessage: 'Displays network of components regulated by given component.' },
   ModelDashBoardViewsModelGraphViewDescription:
   { id: 'ModelDashBoard.Views.ModelGraphViewDescription',
      defaultMessage: 'Displays model network using green edges for positive, red edges for negative regulators and yellow nodes for external components.' }
})