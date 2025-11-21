/**
 * 
 */
package cc.application.main.json;

import java.util.Set;
import java.util.Map;
import java.util.Calendar;
import java.util.Collection;
import java.util.HashMap;

import org.springframework.util.CollectionUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.application.main.json.metadata.EntityMetadataRangeJSON;
import cc.application.main.json.metadata.EntityMetadataValueJSON;
import cc.common.data.biologic.Species;
import cc.common.data.knowledge.ModelReferenceTypes;
import cc.common.data.knowledge.Page;
import cc.common.data.knowledge.PageReference;
import cc.common.data.knowledge.Reference;
import cc.common.data.model.Layout;
import cc.common.data.model.LayoutNode;
import cc.common.data.model.Model;
import cc.common.data.model.ModelComment;
import cc.common.data.model.ModelInitialState;
import cc.common.data.model.ModelLink;
import cc.common.data.model.ModelRating;
import cc.common.data.model.ModelReference;
import cc.common.data.model.ModelShare;
import cc.common.data.simulation.ComponentPair;
import cc.common.data.simulation.Course;
import cc.common.data.simulation.CourseActivity;
import cc.common.data.simulation.CourseMutation;
import cc.common.data.simulation.CourseRange;
import cc.common.data.simulation.InitialState;
import cc.dataaccess.ConditionSpeciesId;
import cc.dataaccess.DominanceId;
import cc.dataaccess.InitialStateSpeciesId;
import cc.dataaccess.SubConditionSpeciesId;

/**
 * @author bkowal
 */
@JsonInclude(Include.NON_NULL)
public class ModelBiologicMap extends Model implements INullableFields {

	public static class NullableFields {
		public static String DESCRIPTION = "description";

		public static String TAGS = "tags";

		public static String AUTHOR = "author";

		public static String DEFAULT_LAYOUT_ID = "defaultLayoutId";

		public static String INITIAL_STATE_ID = "initialStateId";

		public static String LAYOUT_ID = "layoutId";

		public static String WORKSPACE_LAYOUT = "workspaceLayout";

		public static String SURVEY = "survey";

		public static String CONTENT = "content";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	private Map<Long, ModelVersionJSON> modelVersionMap;

	private Map<Long, SpeciesBiologicMap> speciesMap = new HashMap<>();

	private Map<Long, RegulatorBiologicMap> regulatorMap = new HashMap<>();

	private Map<String, DominanceId> dominanceMap = new HashMap<>();

	private Map<Long, ConditionBiologicMap> conditionMap = new HashMap<>();

	private Map<String, ConditionSpeciesId> conditionSpeciesMap = new HashMap<>();

	private Map<Long, SubConditionBiologicMap> subConditionMap = new HashMap<>();

	private Map<String, SubConditionSpeciesId> subConditionSpeciesMap = new HashMap<>();

	private Map<Long, InitialStateMap> initialStateMap = new HashMap<>();

	private Map<String, InitialStateSpeciesId> initialStateSpeciesMap = new HashMap<>();

	private Rating modelRating;

	private Map<Long, ModelCommentMap> modelCommentMap = new HashMap<>();

	private Map<Long, ModelShareMap> shareMap = new HashMap<>();

	private Map<Long, ModelLinkJSON> linkMap = new HashMap<>();

	private ModelPermissions permissions;

	private Map<Long, ModelReferenceMap> modelReferenceMap = new HashMap<>();

	private Map<Long, ReferenceMap> referenceMap = new HashMap<>();

	private Map<Long, PageMap> pageMap = new HashMap<>();

	private Map<Long, PageReferenceMap> pageReferenceMap = new HashMap<>();

	private Map<Long, SectionMap> sectionMap = new HashMap<>();

	private Map<Long, ContentMap> contentMap = new HashMap<>();

	private Map<Long, ContentReferenceMap> contentReferenceMap = new HashMap<>();

	private Map<Long, ExperimentMap> experimentMap = new HashMap<>();

	private Map<Long, EntityMetadataValueJSON> metadataValueMap = new HashMap<>();

	private Map<String, EntityMetadataRangeJSON> metadataRangeMap = new HashMap<>();

	private Map<Long, UploadJSON> uploadMap = new HashMap<>();

	private Map<Long, CourseJSON> courseMap = new HashMap<>();

	private Map<Long, CourseRangeJSON> courseRangeMap = new HashMap<>();

	private Map<Long, CourseActivityJSON> courseActivityMap = new HashMap<>();

	private Map<Long, CourseMutationJSON> courseMutationMap = new HashMap<>();

	private Map<Long, CalcIntervalJSON> calcIntervalMap = new HashMap<>();

	private Map<Long, ComponentPairJSON> componentPairMap = new HashMap<>();

	private Map<Long, ModelReferenceTypesJSON> modelReferenceTypesMap = new HashMap<>();

	private Map<Long, LayoutJSON> layoutMap = new HashMap<>();

	private Map<Long, LearningActivityJSON> learningActivityMap = new HashMap<>();

	private Map<Long, LearningActivityGroupJSON> learningActivityGroupMap = new HashMap<>();

	private Long defaultLayoutId;

	private Map<Long, LayoutNodeJSON> layoutNodeMap = new HashMap<>();

	private Map<Long, RealtimeEnvironmentJSON> realtimeEnvironmentMap = new HashMap<>();

	private Map<Long, RealtimeActivityJSON> realtimeActivityMap = new HashMap<>();

	private Map<Long, AnalysisEnvironmentJSON> analysisEnvironmentMap = new HashMap<>();

	private Map<Long, AnalysisActivityJSON> analysisActivityMap = new HashMap<>();

	public ModelBiologicMap() {
	}

	public ModelBiologicMap(ModelBiologicMap modelBiologicMap) {
		super.setPublished(modelBiologicMap.isPublished());
		super.setModelInitialState(modelBiologicMap.getModelInitialState());
		super.setCited(modelBiologicMap.getCited());
		super.setComponents(modelBiologicMap.getComponents());
		super.setInteractions(modelBiologicMap.getInteractions());
		super.setType(modelBiologicMap.getType());
		this.speciesMap = modelBiologicMap.speciesMap;
		this.regulatorMap = modelBiologicMap.regulatorMap;
		this.dominanceMap = modelBiologicMap.dominanceMap;
		this.conditionMap = modelBiologicMap.conditionMap;
		this.conditionSpeciesMap = modelBiologicMap.conditionSpeciesMap;
		this.subConditionMap = modelBiologicMap.subConditionMap;
		this.subConditionSpeciesMap = modelBiologicMap.subConditionSpeciesMap;
		this.initialStateMap = modelBiologicMap.initialStateMap;
		this.initialStateSpeciesMap = modelBiologicMap.initialStateSpeciesMap;
		this.modelRating = modelBiologicMap.modelRating;
		this.modelCommentMap = modelBiologicMap.modelCommentMap;
		this.modelReferenceMap = modelBiologicMap.modelReferenceMap;
		this.referenceMap = modelBiologicMap.referenceMap;
		this.pageMap = modelBiologicMap.pageMap;
		this.pageReferenceMap = modelBiologicMap.pageReferenceMap;
		this.sectionMap = modelBiologicMap.sectionMap;
		this.contentMap = modelBiologicMap.contentMap;
		this.contentReferenceMap = modelBiologicMap.contentReferenceMap;
		this.courseMap = modelBiologicMap.courseMap;
		this.courseRangeMap = modelBiologicMap.courseRangeMap;
		this.courseActivityMap = modelBiologicMap.courseActivityMap;
		this.courseMutationMap = modelBiologicMap.courseMutationMap;
		this.calcIntervalMap = modelBiologicMap.calcIntervalMap;
		this.componentPairMap = modelBiologicMap.componentPairMap;
		this.layoutMap = modelBiologicMap.layoutMap;
		this.layoutNodeMap = modelBiologicMap.layoutNodeMap;
		this.learningActivityMap = modelBiologicMap.learningActivityMap;
		this.learningActivityGroupMap = modelBiologicMap.learningActivityGroupMap;
		this.realtimeEnvironmentMap = modelBiologicMap.realtimeEnvironmentMap;
		this.realtimeActivityMap = modelBiologicMap.realtimeActivityMap;
		this.analysisEnvironmentMap = modelBiologicMap.analysisEnvironmentMap;
		this.analysisActivityMap = modelBiologicMap.analysisActivityMap;
	}

	public ModelBiologicMap(Model model) {
		super(model);
		this.constructBiologicMapping();
		this.constructInitialStateMapping();
		this.constructModelCommentMapping();
		this.constructModelReferenceMapping();

		if (!CollectionUtils.isEmpty(model.getCourses())) {
			Map<Long, CourseJSON> courseMap = new HashMap<>();
			Map<Long, CourseRangeJSON> courseRangeMap = new HashMap<>();
			Map<Long, CourseActivityJSON> courseActivityMap = new HashMap<>();
			Map<Long, CourseMutationJSON> courseMutationMap = new HashMap<>();
			for (Course course : model.getCourses()) {
				courseMap.put(course.getId(), new CourseJSON(course));
				if (!CollectionUtils.isEmpty(course.getRanges())) {
					for (CourseRange courseRange : course.getRanges()) {
						courseRangeMap.put(courseRange.getId(), new CourseRangeJSON(courseRange));
						if (!CollectionUtils.isEmpty(courseRange.getActivities())) {
							for (CourseActivity activity : courseRange.getActivities()) {
								courseActivityMap.put(activity.getId(), new CourseActivityJSON(activity));
							}
						}
						if (!CollectionUtils.isEmpty(courseRange.getMutations())) {
							for (CourseMutation mutation : courseRange.getMutations()) {
								courseMutationMap.put(mutation.getId(), new CourseMutationJSON(mutation));
							}
						}
					}
				}
			}
			setCourseMap(courseMap);
			setCourseRangeMap(courseRangeMap);
			setCourseActivityMap(courseActivityMap);
			setCourseMutationMap(courseMutationMap);
		}
	}

	/**
	 * Builds a new {@link Model} based on the contents of the
	 * {@link ModelBiologicMap}. This method should only be used for id values in
	 * the containing {@link Map} that are <= 0. Note: this method does not set
	 * creation and update date fields on the {@link Model} object that is created.
	 * 
	 * @return the constructed {@link Model}.
	 */
	public Model constructNewModel() {
		Model model = new Model();
		model.setName(getName());
		model.setDescription(getDescription());
		model.setTags(getTags());
		model.setAuthor(getAuthor());
		model.setPublished(isPublished());
		model.setModelInitialState(getModelInitialState());
		model.setComponents(getComponents());
		model.setInteractions(getInteractions());
		model.setType(getType());
		model.setOriginId(getOriginId());

		return model;
	}

	public void constructShareMapping(Collection<ModelShare> modelShares) {
		if (modelShares.isEmpty()) {
			return;
		}

		this.shareMap = new HashMap<>();
		for (ModelShare modelShare : modelShares) {
			ModelShareMap modelShareMap = new ModelShareMap(modelShare);
			this.shareMap.put(modelShare.getId(), modelShareMap);
		}
	}

	public void constructLinkMapping(Collection<ModelLink> modelLinks) {
		if (modelLinks.isEmpty()) {
			return;
		}

		this.linkMap = new HashMap<>();
		for (ModelLink modelLink : modelLinks) {
			ModelLinkJSON modelLinkJSON = new ModelLinkJSON(modelLink);
			this.linkMap.put(modelLink.getId(), modelLinkJSON);
		}
	}

	public void constructKnowledgeBaseMapping(Page page) {
		PageMap pageMap = new PageMap(page);
		this.pageMap.put(page.getId(), pageMap);
		Map<Long, SectionMap> pageSectionMap = pageMap.buildSectionMap();
		if (pageSectionMap.isEmpty() == false) {
			for (SectionMap sectionMap : pageSectionMap.values()) {
				Map<Long, ContentMap> sectionContentMap = sectionMap.buildContentMap();
				if (sectionContentMap.isEmpty() == false) {
					for (ContentMap contentMap : sectionContentMap.values()) {
						this.contentReferenceMap.putAll(contentMap.constructReferenceMap(this.referenceMap));
					}
					this.contentMap.putAll(sectionContentMap);
				}
			}

			this.sectionMap.putAll(pageSectionMap);
		}

		if (CollectionUtils.isEmpty(page.getReferences()) == false) {
			for (PageReference pageReference : page.getReferences()) {
				Reference reference = pageReference.getReference();
				if (this.referenceMap.containsKey(reference.getId()) == false) {
					ReferenceMap referenceMap = new ReferenceMap(reference);
					this.referenceMap.put(reference.getId(), referenceMap);
				}
				PageReferenceMap pageReferenceMap = new PageReferenceMap(pageReference);
				this.pageReferenceMap.put(pageReference.getId(), pageReferenceMap);
			}
		}

		// validate.
		for (ContentMap contentMap : this.contentMap.values()) {
			if (this.sectionMap.containsKey(contentMap.getSectionId()) == false) {
				System.out.println(
						"Found missing section: " + contentMap.getSectionId() + " for content: " + contentMap.getId());
			}
		}
	}

	public void constructComponentPairMapping(final Collection<ComponentPair> componentPairs) {
		if (CollectionUtils.isEmpty(componentPairs)) {
			return;
		}
		for (ComponentPair componentPair : componentPairs) {
			componentPairMap.put(componentPair.getId(), new ComponentPairJSON(componentPair));
		}
	}

	public void constructModelReferenceTypesMapping(final Collection<ModelReferenceTypes> modelReferenceTypes) {
		if (CollectionUtils.isEmpty(modelReferenceTypes)) {
			return;
		}
		for (ModelReferenceTypes _modelReferenceTypes : modelReferenceTypes) {
			modelReferenceTypesMap.put(_modelReferenceTypes.getId(), new ModelReferenceTypesJSON(_modelReferenceTypes));
		}
	}

	private void constructBiologicMapping() {
		if (CollectionUtils.isEmpty(super.getSpecies())) {
			return;
		}

		for (Species species : super.getSpecies()) {
			SpeciesBiologicMap speciesBiologicMap = new SpeciesBiologicMap(species);
			this.speciesMap.put(species.getId(), speciesBiologicMap);

			Map<Long, RegulatorBiologicMap> regulatorMap = speciesBiologicMap.buildRegulatorBiologicMap();
			this.regulatorMap.putAll(regulatorMap);

			for (RegulatorBiologicMap regulatorBiologicMap : regulatorMap.values()) {
				Map<Long, ConditionBiologicMap> conditionMap = regulatorBiologicMap.buildConditionMap();
				this.conditionMap.putAll(conditionMap);

				for (ConditionBiologicMap conditionBiologicMap : conditionMap.values()) {
					this.conditionSpeciesMap.putAll(conditionBiologicMap.buildSpeciesMap());

					Map<Long, SubConditionBiologicMap> subConditionMap = conditionBiologicMap.buildSubConditionMap();
					for (SubConditionBiologicMap subConditionBiologicMap : subConditionMap.values()) {
						this.subConditionSpeciesMap.putAll(subConditionBiologicMap.buildSpeciesMap());
					}
					this.subConditionMap.putAll(subConditionMap);
				}

				this.dominanceMap.putAll(regulatorBiologicMap.buildDominanceMap());
			}
		}
	}

	private void constructInitialStateMapping() {
		if (CollectionUtils.isEmpty(super.getInitialStates())) {
			return;
		}

		for (InitialState initialState : getInitialStates()) {
			InitialStateMap initialStateMap = new InitialStateMap(initialState);
			this.initialStateMap.put(initialState.getId(), initialStateMap);
			this.initialStateSpeciesMap.putAll(initialStateMap.buildSpeciesMap());
		}
	}

	private void constructModelCommentMapping() {
		if (CollectionUtils.isEmpty(super.getModelComments())) {
			return;
		}

		for (ModelComment comment : getModelComments()) {
			ModelCommentMap commentMap = new ModelCommentMap(comment);
			this.modelCommentMap.put(comment.getId(), commentMap);
		}
	}

	private void constructModelReferenceMapping() {
		if (CollectionUtils.isEmpty(super.getReferences())) {
			return;
		}

		for (ModelReference modelReference : super.getReferences()) {
			ModelReferenceMap modelReferenceMap = new ModelReferenceMap(modelReference);
			this.modelReferenceMap.put(modelReference.getId(), modelReferenceMap);
			ReferenceMap referenceMap = new ReferenceMap(modelReference.getReference());
			this.referenceMap.put(modelReference.getReference().getId(), referenceMap);
		}
	}

	public void constructLayoutMapping(final Collection<Layout> layouts) {
		for (Layout layout : layouts) {
			layoutMap.put(layout.getId(), new LayoutJSON(layout));
		}
	}

	public void constructLayoutNodeMapping(final Collection<LayoutNode> layoutNodes) {
		for (LayoutNode layoutNode : layoutNodes) {
			layoutNodeMap.put(layoutNode.getId(), new LayoutNodeJSON(layoutNode));
		}
	}

	public boolean modelUpdated() {
		return this.nullableFields.isEmpty() == false || this.getName() != null || this.getAuthor() != null
				|| this.isPublished() != null || this.getInitialStateId() != null;
	}

	public boolean experimentsOnly(final long modelId) {
		if (this.experimentMap.isEmpty() && this.calcIntervalMap.isEmpty()) {
			return false;
		}

		return (modelId > 0 && this.getName() == null && this.getDescription() == null && this.getTags() == null
				&& this.speciesMap.isEmpty() && this.regulatorMap.isEmpty() && this.dominanceMap.isEmpty()
				&& this.conditionMap.isEmpty() && this.conditionSpeciesMap.isEmpty() && this.subConditionMap.isEmpty()
				&& this.subConditionSpeciesMap.isEmpty() && this.initialStateMap.isEmpty()
				&& this.initialStateSpeciesMap.isEmpty() && this.modelRating == null && this.modelCommentMap.isEmpty()
				&& this.modelReferenceMap.isEmpty() && this.referenceMap.isEmpty() && this.pageMap.isEmpty()
				&& this.pageReferenceMap.isEmpty() && this.sectionMap.isEmpty() && this.contentMap.isEmpty()
				&& this.contentReferenceMap.isEmpty() && this.layoutMap.isEmpty() && this.layoutNodeMap.isEmpty()
				&& this.shareMap.isEmpty() && this.linkMap.isEmpty() && this.learningActivityMap.isEmpty() && this.learningActivityGroupMap.isEmpty());
	}

	@Override
	public boolean wasSetNull(final String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@Override
	public void setDescription(String description) {
		super.setDescription(description);
		this.nullableFields.handleNullSet(description, NullableFields.DESCRIPTION);
	}

	@Override
	public void setTags(String tags) {
		super.setTags(tags);
		this.nullableFields.handleNullSet(tags, NullableFields.TAGS);
	}

	@Override
	public void setAuthor(String author) {
		super.setAuthor(author);
		this.nullableFields.handleNullSet(author, NullableFields.AUTHOR);
	}

	/**
	 * @return the initialStateId
	 */
	public Long getInitialStateId() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getInitialStateId();
	}

	/**
	 * @param initialStateId
	 *            the initialStateId to set
	 */
	public void setInitialStateId(Long initialStateId) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setInitialStateId(initialStateId);
		nullableFields.handleNullSet(initialStateId, NullableFields.INITIAL_STATE_ID);
	}

	public Long getLayoutId() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getLayoutId();
	}

	public void setLayoutId(Long layoutId) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setLayoutId(layoutId);
		nullableFields.handleNullSet(layoutId, NullableFields.LAYOUT_ID);
	}

	public Object getWorkspaceLayout() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getWorkspaceLayoutAsJSON();
	}

	public void setWorkspaceLayout(Object workspaceLayout) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setWorkspaceLayoutAsJSON(workspaceLayout);
		nullableFields.handleNullSet(workspaceLayout, NullableFields.WORKSPACE_LAYOUT);
	}

	public Object getSurvey() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getSurveyAsJSON();
	}

	public Object getContent() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getContentAsJSON();
	}

	public void setSurvey(Object survey) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setSurveyAsJSON(survey);
		nullableFields.handleNullSet(survey, NullableFields.SURVEY);
	}

	public void setContent(Object content) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setContentAsJSON(content);
		nullableFields.handleNullSet(content, NullableFields.CONTENT);
	}

	@JsonIgnore
	@Override
	public Calendar getUpdateDate() {
		return super.getUpdateDate();
	}

	@JsonIgnore
	@Override
	public ModelInitialState getModelInitialState() {
		return super.getModelInitialState();
	}

	@JsonIgnore
	@Override
	public Set<Species> getSpecies() {
		return super.getSpecies();
	}

	@JsonIgnore
	@Override
	public Set<InitialState> getInitialStates() {
		return super.getInitialStates();
	}

	@JsonIgnore
	@Override
	public ModelRating getRating() {
		return super.getRating();
	}

	@JsonIgnore
	@Override
	public Set<ModelComment> getModelComments() {
		return super.getModelComments();
	}

	@JsonIgnore
	@Override
	public Set<ModelReference> getReferences() {
		return super.getReferences();
	}

	public Map<Long, ModelVersionJSON> getModelVersionMap() {
		return modelVersionMap;
	}

	public void setModelVersionMap(Map<Long, ModelVersionJSON> modelVersionMap) {
		this.modelVersionMap = modelVersionMap;
	}

	/**
	 * @return the speciesMap
	 */
	public Map<Long, SpeciesBiologicMap> getSpeciesMap() {
		return speciesMap;
	}

	/**
	 * @param speciesMap
	 *            the speciesMap to set
	 */
	public void setSpeciesMap(Map<Long, SpeciesBiologicMap> speciesMap) {
		this.speciesMap = speciesMap;
	}

	/**
	 * @return the regulatorMap
	 */
	public Map<Long, RegulatorBiologicMap> getRegulatorMap() {
		return regulatorMap;
	}

	/**
	 * @param regulatorMap
	 *            the regulatorMap to set
	 */
	public void setRegulatorMap(Map<Long, RegulatorBiologicMap> regulatorMap) {
		this.regulatorMap = regulatorMap;
	}

	/**
	 * @return the dominanceMap
	 */
	public Map<String, DominanceId> getDominanceMap() {
		return dominanceMap;
	}

	/**
	 * @param dominanceMap
	 *            the dominanceMap to set
	 */
	public void setDominanceMap(Map<String, DominanceId> dominanceMap) {
		this.dominanceMap = dominanceMap;
	}

	/**
	 * @return the conditionMap
	 */
	public Map<Long, ConditionBiologicMap> getConditionMap() {
		return conditionMap;
	}

	/**
	 * @param conditionMap
	 *            the conditionMap to set
	 */
	public void setConditionMap(Map<Long, ConditionBiologicMap> conditionMap) {
		this.conditionMap = conditionMap;
	}

	/**
	 * @return the conditionSpeciesMap
	 */
	public Map<String, ConditionSpeciesId> getConditionSpeciesMap() {
		return conditionSpeciesMap;
	}

	/**
	 * @param conditionSpeciesMap
	 *            the conditionSpeciesMap to set
	 */
	public void setConditionSpeciesMap(Map<String, ConditionSpeciesId> conditionSpeciesMap) {
		this.conditionSpeciesMap = conditionSpeciesMap;
	}

	/**
	 * @return the subConditionBiologicMap
	 */
	public Map<Long, SubConditionBiologicMap> getSubConditionMap() {
		return subConditionMap;
	}

	/**
	 * @param subConditionBiologicMap
	 *            the subConditionBiologicMap to set
	 */
	public void setSubConditionMap(Map<Long, SubConditionBiologicMap> subConditionMap) {
		this.subConditionMap = subConditionMap;
	}

	/**
	 * @return the subConditionSpeciesMap
	 */
	public Map<String, SubConditionSpeciesId> getSubConditionSpeciesMap() {
		return subConditionSpeciesMap;
	}

	/**
	 * @param subConditionSpeciesMap
	 *            the subConditionSpeciesMap to set
	 */
	public void setSubConditionSpeciesMap(Map<String, SubConditionSpeciesId> subConditionSpeciesMap) {
		this.subConditionSpeciesMap = subConditionSpeciesMap;
	}

	/**
	 * @return the initialStateMap
	 */
	public Map<Long, InitialStateMap> getInitialStateMap() {
		return initialStateMap;
	}

	/**
	 * @param initialStateMap
	 *            the initialStateMap to set
	 */
	public void setInitialStateMap(Map<Long, InitialStateMap> initialStateMap) {
		this.initialStateMap = initialStateMap;
	}

	/**
	 * @return the initialStateSpeciesMap
	 */
	public Map<String, InitialStateSpeciesId> getInitialStateSpeciesMap() {
		return initialStateSpeciesMap;
	}

	/**
	 * @param initialStateSpeciesMap
	 *            the initialStateSpeciesMap to set
	 */
	public void setInitialStateSpeciesMap(Map<String, InitialStateSpeciesId> initialStateSpeciesMap) {
		this.initialStateSpeciesMap = initialStateSpeciesMap;
	}

	/**
	 * @return the modelRating
	 */
	public Rating getModelRating() {
		return modelRating;
	}

	/**
	 * @param modelRating
	 *            the modelRating to set
	 */
	public void setModelRating(Rating modelRating) {
		this.modelRating = modelRating;
	}

	/**
	 * @return the modelCommentMap
	 */
	public Map<Long, ModelCommentMap> getModelCommentMap() {
		return modelCommentMap;
	}

	/**
	 * @param modelCommentMap
	 *            the modelCommentMap to set
	 */
	public void setModelCommentMap(Map<Long, ModelCommentMap> modelCommentMap) {
		this.modelCommentMap = modelCommentMap;
	}

	/**
	 * @return the modelShareMap
	 */
	public Map<Long, ModelShareMap> getShareMap() {
		return shareMap;
	}

	/**
	 * @param modelShareMap
	 *            the modelShareMap to set
	 */
	public void setShareMap(Map<Long, ModelShareMap> shareMap) {
		this.shareMap = shareMap;
	}

	/**
	 * @return the linkMap
	 */
	public Map<Long, ModelLinkJSON> getLinkMap() {
		return linkMap;
	}

	/**
	 * @param linkMap
	 *            the linkMap to set
	 */
	public void setLinkMap(Map<Long, ModelLinkJSON> linkMap) {
		this.linkMap = linkMap;
	}

	/**
	 * @return the permissions
	 */
	public ModelPermissions getPermissions() {
		return permissions;
	}

	/**
	 * @param permissions
	 *            the permissions to set
	 */
	public void setPermissions(ModelPermissions permissions) {
		this.permissions = permissions;
	}

	/**
	 * @return the modelReferenceMap
	 */
	public Map<Long, ModelReferenceMap> getModelReferenceMap() {
		return modelReferenceMap;
	}

	/**
	 * @param modelReferenceMap
	 *            the modelReferenceMap to set
	 */
	public void setModelReferenceMap(Map<Long, ModelReferenceMap> modelReferenceMap) {
		this.modelReferenceMap = modelReferenceMap;
	}

	/**
	 * @return the referenceMap
	 */
	public Map<Long, ReferenceMap> getModelReference() {
		return referenceMap;
	}

	/**
	 * @param referenceMap
	 *            the referenceMap to set
	 */
	public void setModelReference(Map<Long, ReferenceMap> modelReference) {
		this.referenceMap = modelReference;
	}

	/**
	 * @return the referenceMap
	 */
	public Map<Long, ReferenceMap> getReferenceMap() {
		return referenceMap;
	}

	/**
	 * @param referenceMap
	 *            the referenceMap to set
	 */
	public void setReferenceMap(Map<Long, ReferenceMap> referenceMap) {
		this.referenceMap = referenceMap;
	}

	/**
	 * @return the pageMap
	 */
	public Map<Long, PageMap> getPageMap() {
		return pageMap;
	}

	/**
	 * @param pageMap
	 *            the pageMap to set
	 */
	public void setPageMap(Map<Long, PageMap> pageMap) {
		this.pageMap = pageMap;
	}

	/**
	 * @return the pageReferenceMap
	 */
	public Map<Long, PageReferenceMap> getPageReferenceMap() {
		return pageReferenceMap;
	}

	/**
	 * @param pageReferenceMap
	 *            the pageReferenceMap to set
	 */
	public void setPageReferenceMap(Map<Long, PageReferenceMap> pageReferenceMap) {
		this.pageReferenceMap = pageReferenceMap;
	}

	/**
	 * @return the sectionMap
	 */
	public Map<Long, SectionMap> getSectionMap() {
		return sectionMap;
	}

	/**
	 * @param sectionMap
	 *            the sectionMap to set
	 */
	public void setSectionMap(Map<Long, SectionMap> sectionMap) {
		this.sectionMap = sectionMap;
	}

	/**
	 * @return the contentMap
	 */
	public Map<Long, ContentMap> getContentMap() {
		return contentMap;
	}

	/**
	 * @param contentMap
	 *            the contentMap to set
	 */
	public void setContentMap(Map<Long, ContentMap> contentMap) {
		this.contentMap = contentMap;
	}

	/**
	 * @return the contentReferenceMap
	 */
	public Map<Long, ContentReferenceMap> getContentReferenceMap() {
		return contentReferenceMap;
	}

	/**
	 * @param contentReferenceMap
	 *            the contentReferenceMap to set
	 */
	public void setContentReferenceMap(Map<Long, ContentReferenceMap> contentReferenceMap) {
		this.contentReferenceMap = contentReferenceMap;
	}

	/**
	 * @return the experimentMap
	 */
	public Map<Long, ExperimentMap> getExperimentMap() {
		return experimentMap;
	}

	/**
	 * @param experimentMap
	 *            the experimentMap to set
	 */
	public void setExperimentMap(Map<Long, ExperimentMap> experimentMap) {
		this.experimentMap = experimentMap;
	}

	/**
	 * @return the metadataValueMap
	 */
	public Map<Long, EntityMetadataValueJSON> getMetadataValueMap() {
		return metadataValueMap;
	}

	/**
	 * @param metadataValueMap
	 *            the metadataValueMap to set
	 */
	public void setMetadataValueMap(Map<Long, EntityMetadataValueJSON> metadataValueMap) {
		this.metadataValueMap = metadataValueMap;
	}

	/**
	 * @return the metadataRangeMap
	 */
	public Map<String, EntityMetadataRangeJSON> getMetadataRangeMap() {
		return metadataRangeMap;
	}

	/**
	 * @param metadataRangeMap
	 *            the metadataRangeMap to set
	 */
	public void setMetadataRangeMap(Map<String, EntityMetadataRangeJSON> metadataRangeMap) {
		this.metadataRangeMap = metadataRangeMap;
	}

	/**
	 * @return the uploadMap
	 */
	public Map<Long, UploadJSON> getUploadMap() {
		return uploadMap;
	}

	/**
	 * @param uploadMap
	 *            the uploadMap to set
	 */
	public void setUploadMap(Map<Long, UploadJSON> uploadMap) {
		this.uploadMap = uploadMap;
	}

	/**
	 * @return the courseMap
	 */
	public Map<Long, CourseJSON> getCourseMap() {
		return courseMap;
	}

	/**
	 * @param courseMap
	 *            the courseMap to set
	 */
	public void setCourseMap(Map<Long, CourseJSON> courseMap) {
		this.courseMap = courseMap;
	}

	/**
	 * @return the courseRangeMap
	 */
	public Map<Long, CourseRangeJSON> getCourseRangeMap() {
		return courseRangeMap;
	}

	/**
	 * @param courseRangeMap
	 *            the courseRangeMap to set
	 */
	public void setCourseRangeMap(Map<Long, CourseRangeJSON> courseRangeMap) {
		this.courseRangeMap = courseRangeMap;
	}

	/**
	 * @return the courseActivityMap
	 */
	public Map<Long, CourseActivityJSON> getCourseActivityMap() {
		return courseActivityMap;
	}

	/**
	 * @param courseActivityMap
	 *            the courseActivityMap to set
	 */
	public void setCourseActivityMap(Map<Long, CourseActivityJSON> courseActivityMap) {
		this.courseActivityMap = courseActivityMap;
	}

	/**
	 * @return the courseMutationMap
	 */
	public Map<Long, CourseMutationJSON> getCourseMutationMap() {
		return courseMutationMap;
	}

	/**
	 * @param courseMutationMap
	 *            the courseMutationMap to set
	 */
	public void setCourseMutationMap(Map<Long, CourseMutationJSON> courseMutationMap) {
		this.courseMutationMap = courseMutationMap;
	}

	/**
	 * @return the calcIntervalMap
	 */
	public Map<Long, CalcIntervalJSON> getCalcIntervalMap() {
		return calcIntervalMap;
	}

	/**
	 * @param calcIntervalMap
	 *            the calcIntervalMap to set
	 */
	public void setCalcIntervalMap(Map<Long, CalcIntervalJSON> calcIntervalMap) {
		this.calcIntervalMap = calcIntervalMap;
	}

	public Map<Long, ComponentPairJSON> getComponentPairMap() {
		return componentPairMap;
	}

	public void setComponentPairMap(Map<Long, ComponentPairJSON> componentPairMap) {
		this.componentPairMap = componentPairMap;
	}

	public Map<Long, ModelReferenceTypesJSON> getModelReferenceTypesMap() {
		return modelReferenceTypesMap;
	}

	public void setModelReferenceTypesMap(Map<Long, ModelReferenceTypesJSON> modelReferenceTypesMap) {
		this.modelReferenceTypesMap = modelReferenceTypesMap;
	}

	public Map<Long, LayoutJSON> getLayoutMap() {
		return layoutMap;
	}

	public void setLayoutMap(Map<Long, LayoutJSON> layoutMap) {
		this.layoutMap = layoutMap;
	}

	public Long getDefaultLayoutId() {
		return defaultLayoutId;
	}

	public void setDefaultLayoutId(Long defaultLayoutId) {
		this.defaultLayoutId = defaultLayoutId;
	}

	public Map<Long, LayoutNodeJSON> getLayoutNodeMap() {
		return layoutNodeMap;
	}

	public void setLayoutNodeMap(Map<Long, LayoutNodeJSON> layoutNodeMap) {
		this.layoutNodeMap = layoutNodeMap;
	}

	public Map<Long, LearningActivityJSON> getLearningActivityMap() {
		return learningActivityMap;
	}

	public void setLearningActivityMap(Map<Long, LearningActivityJSON> learningActivityMap) {
		this.learningActivityMap = learningActivityMap;
	}

	public Map<Long, LearningActivityGroupJSON> getLearningActivityGroupMap() {
		return learningActivityGroupMap;
	}

	public void setLearningActivityGroupMap(Map<Long, LearningActivityGroupJSON> learningActivityGroupMap) {
		this.learningActivityGroupMap = learningActivityGroupMap;
	}


	public Map<Long, RealtimeEnvironmentJSON> getRealtimeEnvironmentMap() {
		return realtimeEnvironmentMap;
	}

	public void setRealtimeEnvironmentMap(Map<Long, RealtimeEnvironmentJSON> realtimeEnvironmentMap) {
		this.realtimeEnvironmentMap = realtimeEnvironmentMap;
	}

	public Map<Long, RealtimeActivityJSON> getRealtimeActivityMap() {
		return realtimeActivityMap;
	}

	public void setRealtimeActivityMap(Map<Long, RealtimeActivityJSON> realtimeActivityMap) {
		this.realtimeActivityMap = realtimeActivityMap;
	}

	public Map<Long, AnalysisEnvironmentJSON> getAnalysisEnvironmentMap() {
		return analysisEnvironmentMap;
	}

	public void setAnalysisEnvironmentMap(Map<Long, AnalysisEnvironmentJSON> analysisEnvironmentMap) {
		this.analysisEnvironmentMap = analysisEnvironmentMap;
	}

	public Map<Long, AnalysisActivityJSON> getAnalysisActivityMap() {
		return analysisActivityMap;
	}

	public void setAnalysisActivityMap(Map<Long, AnalysisActivityJSON> analysisActivityMap) {
		this.analysisActivityMap = analysisActivityMap;
	}
}