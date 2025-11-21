/**
 * 
 */
package cc.dataaccess;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import cc.common.data.knowledge.Content;
import cc.common.data.knowledge.ContentReference;
import cc.common.data.knowledge.ModelReferenceTypes;
import cc.common.data.knowledge.Page;
import cc.common.data.knowledge.PageReference;
import cc.common.data.knowledge.Reference;
import cc.common.data.knowledge.Section;
import cc.common.data.model.Layout;
import cc.common.data.model.LayoutNode;
import cc.common.data.model.LearningActivity;
import cc.common.data.model.LearningActivityGroup;
import cc.common.data.model.ModelComment;
import cc.common.data.model.ModelLink;
import cc.common.data.model.ModelRating;
import cc.common.data.model.ModelReference;
import cc.common.data.model.ModelShare;
import cc.common.data.model.ModelShareNotification;
import cc.common.data.model.UserModelRating;
import cc.common.data.simulation.Experiment;
import cc.common.data.simulation.InitialState;
import cc.common.simulate.settings.dynamic.DynamicSimulationSettings;

/**
 * POJO used to store / track additional {@link Model} data that is not Biologic
 * information.
 * 
 * @author Bryan Kowal
 */
public class ModelMappedData {

	private final Number modelId;

	/*
	 * Initial State information.
	 */
	private Map<Number, InitialState> initialStates = new HashMap<>();

	private List<InitialState> initialStatesToDelete = new ArrayList<>();

	private Map<Number, InitialStateSpecies> initialStateSpecies = new HashMap<>();

	private ModelRating modelRating;

	private UserModelRating userModelRating;

	private Map<Number, ModelComment> comments = new HashMap<>();

	private List<ModelComment> commentsToDelete = new ArrayList<>();

	private Map<Number, ModelShare> shares = new HashMap<>();

	private Map<Number, ModelShareNotification> shareNotifications = new HashMap<>();

	private List<ModelShare> sharesToDelete = new ArrayList<>();

	private Map<Number, ModelLink> links = new HashMap<>();

	private List<ModelLink> linksToDelete = new ArrayList<>();

	private Map<Long, Layout> layoutsToSave = new HashMap<>();

	private Map<Long, Layout> layoutsToDelete = new HashMap<>();

	private Map<Long, LayoutNode> layoutNodesToSave = new HashMap<>();

	private Map<Long, LayoutNode> layoutNodesToDelete = new HashMap<>();

	/*
	 * Knowledge Base
	 */

	private final Map<Number, ModelReference> modelReferences = new HashMap<>();

	private final List<ModelReference> modelReferencesToDelete = new ArrayList<>();

	private final Map<Number, Reference> references = new HashMap<>();

	private final List<Reference> referencesToDelete = new ArrayList<>();

	private final Map<Number, Page> pages = new HashMap<>();

	private final List<Page> pagesToDelete = new ArrayList<>();

	private final Map<Number, PageReference> pageReferences = new HashMap<>();

	private final List<PageReference> pageReferencesToDelete = new ArrayList<>();

	private final Map<Number, Section> sections = new HashMap<>();

	private final List<Section> sectionsToDelete = new ArrayList<>();

	private final Map<Number, Content> contents = new HashMap<>();

	private final List<Content> contentsToDelete = new ArrayList<>();

	private final Map<Number, ContentReference> contentReferences = new HashMap<>();

	private final List<ContentReference> contentReferencesToDelete = new ArrayList<>();

	private Map<Long, ModelReferenceTypes> modelReferenceTypesToSave = new HashMap<>();

	private Map<Long, ModelReferenceTypes> modelReferenceTypesToDelete = new HashMap<>();

	/*
	 * Simulations
	 */

	private final Map<Number, Experiment> experiments = new HashMap<>();

	private final Map<Number, DynamicSimulationSettings> experimentSettingsMap = new HashMap<>();

	private final List<Experiment> experimentsToDelete = new ArrayList<>();


	private Map<Long, LearningActivity> learningActivities = new HashMap<>();

	private Map<Long, LearningActivity> learningActivitiesToDelete = new HashMap<>();

	private Map<Long, LearningActivityGroup> learningActivityGroups = new HashMap<>();
	private Map<Long, LearningActivityGroup> learningActivityGroupsToDelete = new HashMap<>();


	/*
	 * Knowledge Base information.
	 */

	public ModelMappedData(Number modelId) {
		this.modelId = modelId;
	}

	public void addInitialState(final Number id, InitialState initialState) {
		this.initialStates.put(id, initialState);
	}

	public void addInitialStateToDelete(InitialState initialState) {
		this.initialStatesToDelete.add(initialState);
	}

	public void addInitialStateSpecies(final Number id, InitialStateSpecies initialStateSpecies) {
		this.initialStateSpecies.put(id, initialStateSpecies);
	}

	public void addComment(final Number id, ModelComment comment) {
		this.comments.put(id, comment);
	}

	public void addCommentToDelete(ModelComment comment) {
		this.commentsToDelete.add(comment);
	}

	public void addShare(final Number id, ModelShare share) {
		this.shares.put(id, share);
	}

	public void addShareNotification(final Number id, ModelShareNotification modelShareNotification) {
		this.shareNotifications.put(id, modelShareNotification);
	}

	public void addShareToDelete(ModelShare share) {
		this.sharesToDelete.add(share);
	}

	public void addLink(final Number id, ModelLink link) {
		this.links.put(id, link);
	}

	public void addLinkToDelete(ModelLink link) {
		this.linksToDelete.add(link);
	}

	public void addLayout(final Long id, Layout layout) {
		layoutsToSave.put(id, layout);
	}

	public void addLayoutToDelete(final Layout layout) {
		layoutsToDelete.put(layout.getId(), layout);
	}

	public void addLayoutNode(final Long id, LayoutNode layoutNode) {
		layoutNodesToSave.put(id, layoutNode);
	}

	public void addLayoutNodeToDelete(final LayoutNode layoutNode) {
		layoutNodesToDelete.put(layoutNode.getId(), layoutNode);
	}

	public void addModelReference(final Number id, ModelReference modelReference) {
		this.modelReferences.put(id, modelReference);
	}

	public void addModelReferenceToDelete(ModelReference modelReference) {
		this.modelReferencesToDelete.add(modelReference);
	}

	public void addReference(final Number id, Reference reference) {
		this.references.put(id, reference);
	}

	public void addReferenceToDelete(Reference reference) {
		this.referencesToDelete.add(reference);
	}

	public void addPage(final Number id, Page page) {
		this.pages.put(id, page);
	}

	public void addPageToDelete(Page page) {
		this.pagesToDelete.add(page);
	}

	public void addPageReference(final Number id, PageReference pageReference) {
		this.pageReferences.put(id, pageReference);
	}

	public void addPageReferenceToDelete(PageReference pageReference) {
		this.pageReferencesToDelete.add(pageReference);
	}

	public void addSection(final Number id, Section section) {
		this.sections.put(id, section);
	}

	public void addSectionToDelete(Section section) {
		this.sectionsToDelete.add(section);
	}

	public void addContent(final Number id, Content content) {
		this.contents.put(id, content);
	}

	public void addContentToDelete(Content content) {
		this.contentsToDelete.add(content);
	}

	public void addContentReference(final Number id, ContentReference contentReference) {
		this.contentReferences.put(id, contentReference);
	}

	public void addContentReferenceToDelete(ContentReference contentReference) {
		this.contentReferencesToDelete.add(contentReference);
	}

	public void addExperiment(final Number id, final Experiment experiment) {
		this.experiments.put(id, experiment);
	}

	public void addExperimentSettings(final Number id, DynamicSimulationSettings settings) {
		this.experimentSettingsMap.put(id, settings);
	}

	public void addExperimentToDelete(Experiment experiment) {
		this.experimentsToDelete.add(experiment);
	}

	/**
	 * @return the modelId
	 */
	public Number getModelId() {
		return modelId;
	}

	/**
	 * @return the initialStates
	 */
	public Map<Number, InitialState> getInitialStates() {
		return initialStates;
	}

	/**
	 * @param initialStates
	 *            the initialStates to set
	 */
	public void setInitialStates(Map<Number, InitialState> initialStates) {
		this.initialStates = initialStates;
	}

	/**
	 * @return the initialStatesToDelete
	 */
	public List<InitialState> getInitialStatesToDelete() {
		return initialStatesToDelete;
	}

	/**
	 * @param initialStatesToDelete
	 *            the initialStatesToDelete to set
	 */
	public void setInitialStatesToDelete(List<InitialState> initialStatesToDelete) {
		this.initialStatesToDelete = initialStatesToDelete;
	}

	/**
	 * @return the initialStateSpecies
	 */
	public Map<Number, InitialStateSpecies> getInitialStateSpecies() {
		return initialStateSpecies;
	}

	/**
	 * @param initialStateSpecies
	 *            the initialStateSpecies to set
	 */
	public void setInitialStateSpecies(Map<Number, InitialStateSpecies> initialStateSpecies) {
		this.initialStateSpecies = initialStateSpecies;
	}

	/**
	 * @return the modelRating
	 */
	public ModelRating getModelRating() {
		return modelRating;
	}

	/**
	 * @param modelRating
	 *            the modelRating to set
	 */
	public void setModelRating(ModelRating modelRating) {
		this.modelRating = modelRating;
	}

	/**
	 * @return the userModelRating
	 */
	public UserModelRating getUserModelRating() {
		return userModelRating;
	}

	/**
	 * @param userModelRating
	 *            the userModelRating to set
	 */
	public void setUserModelRating(UserModelRating userModelRating) {
		this.userModelRating = userModelRating;
	}

	/**
	 * @return the comments
	 */
	public Map<Number, ModelComment> getComments() {
		return comments;
	}

	/**
	 * @param comments
	 *            the comments to set
	 */
	public void setComments(Map<Number, ModelComment> comments) {
		this.comments = comments;
	}

	/**
	 * @return the commentsToDelete
	 */
	public List<ModelComment> getCommentsToDelete() {
		return commentsToDelete;
	}

	/**
	 * @param commentsToDelete
	 *            the commentsToDelete to set
	 */
	public void setCommentsToDelete(List<ModelComment> commentsToDelete) {
		this.commentsToDelete = commentsToDelete;
	}

	/**
	 * @return the shares
	 */
	public Map<Number, ModelShare> getShares() {
		return shares;
	}

	/**
	 * @param shares
	 *            the shares to set
	 */
	public void setShares(Map<Number, ModelShare> shares) {
		this.shares = shares;
	}

	public Map<Number, ModelShareNotification> getShareNotifications() {
		return shareNotifications;
	}

	public void setShareNotifications(Map<Number, ModelShareNotification> shareNotifications) {
		this.shareNotifications = shareNotifications;
	}

	/**
	 * @return the sharesToDelete
	 */
	public List<ModelShare> getSharesToDelete() {
		return sharesToDelete;
	}

	/**
	 * @param sharesToDelete
	 *            the sharesToDelete to set
	 */
	public void setSharesToDelete(List<ModelShare> sharesToDelete) {
		this.sharesToDelete = sharesToDelete;
	}

	/**
	 * @return the links
	 */
	public Map<Number, ModelLink> getLinks() {
		return links;
	}

	/**
	 * @param links
	 *            the links to set
	 */
	public void setLinks(Map<Number, ModelLink> links) {
		this.links = links;
	}

	/**
	 * @return the linksToDelete
	 */
	public List<ModelLink> getLinksToDelete() {
		return linksToDelete;
	}

	/**
	 * @param linksToDelete
	 *            the linksToDelete to set
	 */
	public void setLinksToDelete(List<ModelLink> linksToDelete) {
		this.linksToDelete = linksToDelete;
	}

	public Map<Long, Layout> getLayoutsToSave() {
		return layoutsToSave;
	}

	public void setLayoutsToSave(Map<Long, Layout> layoutsToSave) {
		this.layoutsToSave = layoutsToSave;
	}

	public Map<Long, Layout> getLayoutsToDelete() {
		return layoutsToDelete;
	}

	public void setLayoutsToDelete(Map<Long, Layout> layoutsToDelete) {
		this.layoutsToDelete = layoutsToDelete;
	}

	public Map<Long, LayoutNode> getLayoutNodesToSave() {
		return layoutNodesToSave;
	}

	public void setLayoutNodesToSave(Map<Long, LayoutNode> layoutNodesToSave) {
		this.layoutNodesToSave = layoutNodesToSave;
	}

	public Map<Long, LayoutNode> getLayoutNodesToDelete() {
		return layoutNodesToDelete;
	}

	public void setLayoutNodesToDelete(Map<Long, LayoutNode> layoutNodesToDelete) {
		this.layoutNodesToDelete = layoutNodesToDelete;
	}

	/**
	 * @return the modelReferences
	 */
	public Map<Number, ModelReference> getModelReferences() {
		return modelReferences;
	}

	/**
	 * @return the modelReferencesToDelete
	 */
	public List<ModelReference> getModelReferencesToDelete() {
		return modelReferencesToDelete;
	}

	/**
	 * @return the references
	 */
	public Map<Number, Reference> getReferences() {
		return references;
	}

	/**
	 * @return the referencesToDelete
	 */
	public List<Reference> getReferencesToDelete() {
		return referencesToDelete;
	}

	/**
	 * @return the pages
	 */
	public Map<Number, Page> getPages() {
		return pages;
	}

	/**
	 * @return the pagesToDelete
	 */
	public List<Page> getPagesToDelete() {
		return pagesToDelete;
	}

	/**
	 * @return the pageReferences
	 */
	public Map<Number, PageReference> getPageReferences() {
		return pageReferences;
	}

	/**
	 * @return the pageReferencesToDelete
	 */
	public List<PageReference> getPageReferencesToDelete() {
		return pageReferencesToDelete;
	}

	/**
	 * @return the sections
	 */
	public Map<Number, Section> getSections() {
		return sections;
	}

	/**
	 * @return the sectionsToDelete
	 */
	public List<Section> getSectionsToDelete() {
		return sectionsToDelete;
	}

	/**
	 * @return the contents
	 */
	public Map<Number, Content> getContents() {
		return contents;
	}

	/**
	 * @return the contentsToDelete
	 */
	public List<Content> getContentsToDelete() {
		return contentsToDelete;
	}

	/**
	 * @return the contentReferences
	 */
	public Map<Number, ContentReference> getContentReferences() {
		return contentReferences;
	}

	/**
	 * @return the contentReferencesToDelete
	 */
	public List<ContentReference> getContentReferencesToDelete() {
		return contentReferencesToDelete;
	}

	/**
	 * @return the experiments
	 */
	public Map<Number, Experiment> getExperiments() {
		return experiments;
	}

	/**
	 * @return the experimentSettingsMap
	 */
	public Map<Number, DynamicSimulationSettings> getExperimentSettingsMap() {
		return experimentSettingsMap;
	}

	/**
	 * @return the experimentsToDelete
	 */
	public List<Experiment> getExperimentsToDelete() {
		return experimentsToDelete;
	}

	public Map<Long, ModelReferenceTypes> getModelReferenceTypesToSave() {
		return modelReferenceTypesToSave;
	}

	public void setModelReferenceTypesToSave(Map<Long, ModelReferenceTypes> modelReferenceTypesToSave) {
		this.modelReferenceTypesToSave = modelReferenceTypesToSave;
	}

	public Map<Long, ModelReferenceTypes> getModelReferenceTypesToDelete() {
		return modelReferenceTypesToDelete;
	}

	public void setModelReferenceTypesToDelete(Map<Long, ModelReferenceTypes> modelReferenceTypesToDelete) {
		this.modelReferenceTypesToDelete = modelReferenceTypesToDelete;
	}

	public Map<Long, LearningActivity> getLearningActivities() {
		return learningActivities;
	}

	public void setLearningActivities(Map<Long, LearningActivity> learningActivities) {
		this.learningActivities = learningActivities;
	}

	public Map<Long, LearningActivity> getLearningActivitiesToDelete() {
		return learningActivitiesToDelete;
	}

	public void setLearningActivitiesToDelete(Map<Long, LearningActivity> learningActivitiesToDelete) {
		this.learningActivitiesToDelete = learningActivitiesToDelete;
	}

	public Map<Long, LearningActivityGroup> getLearningActivityGroups() {
		return learningActivityGroups;
	}

	public void setLearningActivityGroups(Map<Long, LearningActivityGroup> learningActivityGroups) {
		this.learningActivityGroups = learningActivityGroups;
	}

	public Map<Long, LearningActivityGroup> getLearningActivityGroupsToDelete() {
		return learningActivityGroupsToDelete;
	}

	public void setLearningActivityGroupsToDelete(Map<Long, LearningActivityGroup> learningActivityGroupsToDelete) {
		this.learningActivityGroupsToDelete = learningActivityGroupsToDelete;
	}


}