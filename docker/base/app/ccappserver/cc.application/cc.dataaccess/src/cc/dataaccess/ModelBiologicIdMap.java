/**
 * 
 */
package cc.dataaccess;

import java.util.Map;
import java.util.HashMap;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author Bryan Kowal
 *
 */
@JsonInclude(Include.NON_NULL)
public class ModelBiologicIdMap {

	// { "-1": { "id": "17", "speciesMap": { "-2": "38", "-3": "39", "-4": "40",
	// "-5": "41" }, "moduleMap": { "-6": "7", "-7": "8" }}}

	/*
	 * The {@link Model} id.
	 */
	private long id;

	private long currentVersion;

	private Map<Integer, Long> speciesIds;

	private Map<Integer, Long> regulatorIds;

	private Map<Integer, Long> conditionIds;

	private Map<Integer, Long> subConditionIds;

	private Map<Integer, String> conditionSpeciesIds;

	private Map<Integer, String> subConditionSpeciesIds;

	private Map<Integer, String> dominanceIds;

	private Map<Integer, Long> initialStateIds;

	private Map<Integer, String> initialStateSpeciesIds;

	private Map<Integer, Long> layoutIds;

	private Map<Integer, Long> layoutNodeIds;

	private Map<Integer, Long> commentIds;

	private Map<Integer, Long> shareIds;

	private Map<Integer, Long> linkIds;

	private Map<Integer, Long> referenceIds;

	private Map<Integer, Long> modelReferenceIds;

	private Map<Integer, Long> pageIds;

	private Map<Integer, Long> pageReferenceIds;

	private Map<Integer, Long> sectionIds;

	private Map<Integer, Long> contentIds;

	private Map<Integer, Long> contentReferenceIds;

	private Map<Integer, Long> experimentIds;

	private Map<Integer, Long> metadataValueIds;

	private Map<Integer, String> metadataRangeIds;

	private Map<Integer, Long> courseIds;

	private Map<Integer, Long> courseRangeIds;

	private Map<Integer, Long> courseActivityIds;

	private Map<Integer, Long> courseMutationIds;

	private Map<Integer, Long> calcIntervalIds;

	private Map<Integer, Long> componentPairIds;

	private Map<Integer, Long> modelReferenceTypesIds;

	private Map<Integer, Long> learningActivityIds;

	private Map<Integer, Long> learningActivityGroupIds;

	private Map<Integer, Long> realtimeEnvironmentIds;

	private Map<Integer, Long> realtimeActivityIds;

	private Map<Integer, Long> analysisEnvironmentIds;

	private Map<Integer, Long> analysisActivityIds;

	public ModelBiologicIdMap() {
	}

	public void addSpeciesId(final Integer jsId, final Long id) {
		if (this.speciesIds == null) {
			this.speciesIds = new HashMap<>();
		}
		this.speciesIds.put(jsId, id);
	}

	public void addRegulatorId(final Integer jsId, final Long id) {
		if (this.regulatorIds == null) {
			this.regulatorIds = new HashMap<>();
		}
		this.regulatorIds.put(jsId, id);
	}

	public void addConditionId(final Integer jsId, final Long id) {
		if (this.conditionIds == null) {
			this.conditionIds = new HashMap<>();
		}
		this.conditionIds.put(jsId, id);
	}

	public void addSubConditionId(final Integer jsId, final Long id) {
		if (this.subConditionIds == null) {
			this.subConditionIds = new HashMap<>();
		}
		this.subConditionIds.put(jsId, id);
	}

	public void addConditionSpeciesId(final Integer jsId, final String id) {
		if (this.conditionSpeciesIds == null) {
			this.conditionSpeciesIds = new HashMap<>();
		}
		this.conditionSpeciesIds.put(jsId, id);
	}

	public void addSubConditionSpeciesId(final Integer jsId, final String id) {
		if (this.subConditionSpeciesIds == null) {
			this.subConditionSpeciesIds = new HashMap<>();
		}
		this.subConditionSpeciesIds.put(jsId, id);
	}

	public void addDominanceId(final Integer jsId, final String id) {
		if (this.dominanceIds == null) {
			this.dominanceIds = new HashMap<>();
		}
		this.dominanceIds.put(jsId, id);
	}

	public void addInitialStateId(final Integer jsId, final Long id) {
		if (this.initialStateIds == null) {
			this.initialStateIds = new HashMap<>();
		}
		this.initialStateIds.put(jsId, id);
	}

	public void addInitialStateSpeciesId(final Integer jsId, final String id) {
		if (this.initialStateSpeciesIds == null) {
			this.initialStateSpeciesIds = new HashMap<>();
		}
		this.initialStateSpeciesIds.put(jsId, id);
	}

	public void addLayoutId(final Integer jsId, final Long id) {
		if (this.layoutIds == null) {
			this.layoutIds = new HashMap<>();
		}
		this.layoutIds.put(jsId, id);
	}

	public void addLayoutNodeId(final Integer jsId, final Long id) {
		if (this.layoutNodeIds == null) {
			this.layoutNodeIds = new HashMap<>();
		}
		this.layoutNodeIds.put(jsId, id);
	}

	public void addCommentId(final Integer jsId, final Long id) {
		if (this.commentIds == null) {
			this.commentIds = new HashMap<>();
		}
		this.commentIds.put(jsId, id);
	}

	public void addShareId(final Integer jsId, final Long id) {
		if (this.shareIds == null) {
			this.shareIds = new HashMap<>();
		}
		this.shareIds.put(jsId, id);
	}

	public void addLinkId(final Integer jsId, final Long id) {
		if (this.linkIds == null) {
			this.linkIds = new HashMap<>();
		}
		this.linkIds.put(jsId, id);
	}

	public void addReferenceId(final Integer jsId, final Long id) {
		if (this.referenceIds == null) {
			this.referenceIds = new HashMap<>();
		}
		this.referenceIds.put(jsId, id);
	}

	public void addModelReferenceId(final Integer jsId, final Long id) {
		if (this.modelReferenceIds == null) {
			this.modelReferenceIds = new HashMap<>();
		}
		this.modelReferenceIds.put(jsId, id);
	}

	public void addPageId(final Integer jsId, final Long id) {
		if (this.pageIds == null) {
			this.pageIds = new HashMap<>();
		}
		this.pageIds.put(jsId, id);
	}

	public void addPageReferenceId(final Integer jsId, final Long id) {
		if (this.pageReferenceIds == null) {
			this.pageReferenceIds = new HashMap<>();
		}
		this.pageReferenceIds.put(jsId, id);
	}

	public void addSectionId(final Integer jsId, final Long id) {
		if (this.sectionIds == null) {
			this.sectionIds = new HashMap<>();
		}
		this.sectionIds.put(jsId, id);
	}

	public void addContentId(final Integer jsId, final Long id) {
		if (this.contentIds == null) {
			this.contentIds = new HashMap<>();
		}
		this.contentIds.put(jsId, id);
	}

	public void addContentReferenceId(final Integer jsId, final Long id) {
		if (this.contentReferenceIds == null) {
			this.contentReferenceIds = new HashMap<>();
		}
		this.contentReferenceIds.put(jsId, id);
	}

	public void addExperimentId(final Integer jsId, final Long id) {
		if (this.experimentIds == null) {
			this.experimentIds = new HashMap<>();
		}
		this.experimentIds.put(jsId, id);
	}

	public void addMetadataValueId(final Integer jsId, final Long id) {
		if (this.metadataValueIds == null) {
			this.metadataValueIds = new HashMap<>();
		}
		this.metadataValueIds.put(jsId, id);
	}

	public void addMetadataRangeId(final Integer jsId, final String id) {
		if (this.metadataRangeIds == null) {
			this.metadataRangeIds = new HashMap<>();
		}
		this.metadataRangeIds.put(jsId, id);
	}

	public void addCourseId(final Integer jsId, final Long id) {
		if (courseIds == null) {
			courseIds = new HashMap<>();
		}
		courseIds.put(jsId, id);
	}

	public void addCourseRangeId(final Integer jsId, final Long id) {
		if (courseRangeIds == null) {
			courseRangeIds = new HashMap<>();
		}
		courseRangeIds.put(jsId, id);
	}

	public void addCourseActivityId(final Integer jsId, final Long id) {
		if (courseActivityIds == null) {
			courseActivityIds = new HashMap<>();
		}
		courseActivityIds.put(jsId, id);
	}

	public void addCourseMutationId(final Integer jsId, final Long id) {
		if (courseMutationIds == null) {
			courseMutationIds = new HashMap<>();
		}
		courseMutationIds.put(jsId, id);
	}

	public void addCalcIntervalId(final Integer jsId, final Long id) {
		if (calcIntervalIds == null) {
			calcIntervalIds = new HashMap<>();
		}
		calcIntervalIds.put(jsId, id);
	}

	public void addComponentPairId(final Integer jsId, final Long id) {
		if (componentPairIds == null) {
			componentPairIds = new HashMap<>();
		}
		componentPairIds.put(jsId, id);
	}

	public void addModelReferenceTypesId(final Integer jsId, final Long id) {
		if (modelReferenceTypesIds == null) {
			modelReferenceTypesIds = new HashMap<>();
		}
		modelReferenceTypesIds.put(jsId, id);
	}

	public void addLearningActivityId(final Integer jsId, final Long id) {
		if (learningActivityIds == null) {
			learningActivityIds = new HashMap<>();
		}
		learningActivityIds.put(jsId, id);
	}

	public void addLearningActivityGroupId(final Integer jsId, final Long id) {
		if (learningActivityGroupIds == null) {
			learningActivityGroupIds = new HashMap<>();
		}
		learningActivityGroupIds.put(jsId, id);
	}


	public void addRealtimeEnvironmentId(final Integer jsId, final Long id) {
		if (realtimeEnvironmentIds == null) {
			realtimeEnvironmentIds = new HashMap<>();
		}
		realtimeEnvironmentIds.put(jsId, id);
	}

	public void addRealtimeActivityId(final Integer jsId, final Long id) {
		if (realtimeActivityIds == null) {
			realtimeActivityIds = new HashMap<>();
		}
		realtimeActivityIds.put(jsId, id);
	}

	public void addAnalysisEnvironmentId(final Integer jsId, final Long id) {
		if (analysisEnvironmentIds == null) {
			analysisEnvironmentIds = new HashMap<>();
		}
		analysisEnvironmentIds.put(jsId, id);
	}

	public void addAnalysisActivityId(final Integer jsId, final Long id) {
		if (analysisActivityIds == null) {
			analysisActivityIds = new HashMap<>();
		}
		analysisActivityIds.put(jsId, id);
	}

	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}

	public long getCurrentVersion() {
		return currentVersion;
	}

	public void setCurrentVersion(long currentVersion) {
		this.currentVersion = currentVersion;
	}

	/**
	 * @return the speciesIds
	 */
	public Map<Integer, Long> getSpeciesIds() {
		return speciesIds;
	}

	/**
	 * @param speciesIds
	 *            the speciesIds to set
	 */
	public void setSpeciesIds(Map<Integer, Long> speciesIds) {
		this.speciesIds = speciesIds;
	}

	/**
	 * @return the regulatorIds
	 */
	public Map<Integer, Long> getRegulatorIds() {
		return regulatorIds;
	}

	/**
	 * @param regulatorIds
	 *            the regulatorIds to set
	 */
	public void setRegulatorIds(Map<Integer, Long> regulatorIds) {
		this.regulatorIds = regulatorIds;
	}

	/**
	 * @return the conditionIds
	 */
	public Map<Integer, Long> getConditionIds() {
		return conditionIds;
	}

	/**
	 * @param conditionIds
	 *            the conditionIds to set
	 */
	public void setConditionIds(Map<Integer, Long> conditionIds) {
		this.conditionIds = conditionIds;
	}

	/**
	 * @return the subConditionIds
	 */
	public Map<Integer, Long> getSubConditionIds() {
		return subConditionIds;
	}

	/**
	 * @param subConditionIds
	 *            the subConditionIds to set
	 */
	public void setSubConditionIds(Map<Integer, Long> subConditionIds) {
		this.subConditionIds = subConditionIds;
	}

	/**
	 * @return the conditionSpeciesIds
	 */
	public Map<Integer, String> getConditionSpeciesIds() {
		return conditionSpeciesIds;
	}

	/**
	 * @param conditionSpeciesIds
	 *            the conditionSpeciesIds to set
	 */
	public void setConditionSpeciesIds(Map<Integer, String> conditionSpeciesIds) {
		this.conditionSpeciesIds = conditionSpeciesIds;
	}

	/**
	 * @return the subConditionSpeciesIds
	 */
	public Map<Integer, String> getSubConditionSpeciesIds() {
		return subConditionSpeciesIds;
	}

	/**
	 * @param subConditionSpeciesIds
	 *            the subConditionSpeciesIds to set
	 */
	public void setSubConditionSpeciesIds(Map<Integer, String> subConditionSpeciesIds) {
		this.subConditionSpeciesIds = subConditionSpeciesIds;
	}

	/**
	 * @return the dominanceIds
	 */
	public Map<Integer, String> getDominanceIds() {
		return dominanceIds;
	}

	/**
	 * @param dominanceIds
	 *            the dominanceIds to set
	 */
	public void setDominanceIds(Map<Integer, String> dominanceIds) {
		this.dominanceIds = dominanceIds;
	}

	/**
	 * @return the initialStateIds
	 */
	public Map<Integer, Long> getInitialStateIds() {
		return initialStateIds;
	}

	/**
	 * @param initialStateIds
	 *            the initialStateIds to set
	 */
	public void setInitialStateIds(Map<Integer, Long> initialStateIds) {
		this.initialStateIds = initialStateIds;
	}

	/**
	 * @return the initialStateSpeciesIds
	 */
	public Map<Integer, String> getInitialStateSpeciesIds() {
		return initialStateSpeciesIds;
	}

	/**
	 * @param initialStateSpeciesIds
	 *            the initialStateSpeciesIds to set
	 */
	public void setInitialStateSpeciesIds(Map<Integer, String> initialStateSpeciesIds) {
		this.initialStateSpeciesIds = initialStateSpeciesIds;
	}

	/**
	 * @return the layoutIds
	 */
	public Map<Integer, Long> getLayoutIds() {
		return layoutIds;
	}

	/**
	 * @param layoutIds
	 *            the layoutIds to set
	 */
	public void setLayoutIds(Map<Integer, Long> layoutIds) {
		this.layoutIds = layoutIds;
	}

	/**
	 * @return the layoutNodeIds
	 */
	public Map<Integer, Long> getLayoutNodeIds() {
		return layoutNodeIds;
	}

	/**
	 * @param layoutNodeIds
	 *            the layoutNodeIds to set
	 */
	public void setLayoutNodeIds(Map<Integer, Long> layoutNodeIds) {
		this.layoutNodeIds = layoutNodeIds;
	}

	/**
	 * @return the commentIds
	 */
	public Map<Integer, Long> getCommentIds() {
		return commentIds;
	}

	/**
	 * @param commentIds
	 *            the commentIds to set
	 */
	public void setCommentIds(Map<Integer, Long> commentIds) {
		this.commentIds = commentIds;
	}

	/**
	 * @return the shareIds
	 */
	public Map<Integer, Long> getShareIds() {
		return shareIds;
	}

	/**
	 * @param shareIds
	 *            the shareIds to set
	 */
	public void setShareIds(Map<Integer, Long> shareIds) {
		this.shareIds = shareIds;
	}

	/**
	 * @return the linkIds
	 */
	public Map<Integer, Long> getLinkIds() {
		return linkIds;
	}

	/**
	 * @param linkIds
	 *            the linkIds to set
	 */
	public void setLinkIds(Map<Integer, Long> linkIds) {
		this.linkIds = linkIds;
	}

	/**
	 * @return the referenceIds
	 */
	public Map<Integer, Long> getReferenceIds() {
		return referenceIds;
	}

	/**
	 * @param referenceIds
	 *            the referenceIds to set
	 */
	public void setReferenceIds(Map<Integer, Long> referenceIds) {
		this.referenceIds = referenceIds;
	}

	/**
	 * @return the modelReferenceIds
	 */
	public Map<Integer, Long> getModelReferenceIds() {
		return modelReferenceIds;
	}

	/**
	 * @param modelReferenceIds
	 *            the modelReferenceIds to set
	 */
	public void setModelReferenceIds(Map<Integer, Long> modelReferenceIds) {
		this.modelReferenceIds = modelReferenceIds;
	}

	/**
	 * @return the pageIds
	 */
	public Map<Integer, Long> getPageIds() {
		return pageIds;
	}

	/**
	 * @param pageIds
	 *            the pageIds to set
	 */
	public void setPageIds(Map<Integer, Long> pageIds) {
		this.pageIds = pageIds;
	}

	/**
	 * @return the pageReferenceIds
	 */
	public Map<Integer, Long> getPageReferenceIds() {
		return pageReferenceIds;
	}

	/**
	 * @param pageReferenceIds
	 *            the pageReferenceIds to set
	 */
	public void setPageReferenceIds(Map<Integer, Long> pageReferenceIds) {
		this.pageReferenceIds = pageReferenceIds;
	}

	/**
	 * @return the sectionIds
	 */
	public Map<Integer, Long> getSectionIds() {
		return sectionIds;
	}

	/**
	 * @param sectionIds
	 *            the sectionIds to set
	 */
	public void setSectionIds(Map<Integer, Long> sectionIds) {
		this.sectionIds = sectionIds;
	}

	/**
	 * @return the contentIds
	 */
	public Map<Integer, Long> getContentIds() {
		return contentIds;
	}

	/**
	 * @param contentIds
	 *            the contentIds to set
	 */
	public void setContentIds(Map<Integer, Long> contentIds) {
		this.contentIds = contentIds;
	}

	/**
	 * @return the contentReferenceIds
	 */
	public Map<Integer, Long> getContentReferenceIds() {
		return contentReferenceIds;
	}

	/**
	 * @param contentReferenceIds
	 *            the contentReferenceIds to set
	 */
	public void setContentReferenceIds(Map<Integer, Long> contentReferenceIds) {
		this.contentReferenceIds = contentReferenceIds;
	}

	/**
	 * @return the experimentIds
	 */
	public Map<Integer, Long> getExperimentIds() {
		return experimentIds;
	}

	/**
	 * @param experimentIds
	 *            the experimentIds to set
	 */
	public void setExperimentIds(Map<Integer, Long> experimentIds) {
		this.experimentIds = experimentIds;
	}

	/**
	 * @return the metadataValueIds
	 */
	public Map<Integer, Long> getMetadataValueIds() {
		return metadataValueIds;
	}

	/**
	 * @param metadataValueIds
	 *            the metadataValueIds to set
	 */
	public void setMetadataValueIds(Map<Integer, Long> metadataValueIds) {
		this.metadataValueIds = metadataValueIds;
	}

	/**
	 * @return the metadataRangeIds
	 */
	public Map<Integer, String> getMetadataRangeIds() {
		return metadataRangeIds;
	}

	/**
	 * @param metadataRangeIds
	 *            the metadataRangeIds to set
	 */
	public void setMetadataRangeIds(Map<Integer, String> metadataRangeIds) {
		this.metadataRangeIds = metadataRangeIds;
	}

	/**
	 * @return the courseIds
	 */
	public Map<Integer, Long> getCourseIds() {
		return courseIds;
	}

	/**
	 * @param courseIds
	 *            the courseIds to set
	 */
	public void setCourseIds(Map<Integer, Long> courseIds) {
		this.courseIds = courseIds;
	}

	/**
	 * @return the courseRangeIds
	 */
	public Map<Integer, Long> getCourseRangeIds() {
		return courseRangeIds;
	}

	/**
	 * @param courseRangeIds
	 *            the courseRangeIds to set
	 */
	public void setCourseRangeIds(Map<Integer, Long> courseRangeIds) {
		this.courseRangeIds = courseRangeIds;
	}

	/**
	 * @return the courseActivityIds
	 */
	public Map<Integer, Long> getCourseActivityIds() {
		return courseActivityIds;
	}

	/**
	 * @param courseActivityIds
	 *            the courseActivityIds to set
	 */
	public void setCourseActivityIds(Map<Integer, Long> courseActivityIds) {
		this.courseActivityIds = courseActivityIds;
	}

	/**
	 * @return the courseMutationIds
	 */
	public Map<Integer, Long> getCourseMutationIds() {
		return courseMutationIds;
	}

	/**
	 * @param courseMutationIds
	 *            the courseMutationIds to set
	 */
	public void setCourseMutationIds(Map<Integer, Long> courseMutationIds) {
		this.courseMutationIds = courseMutationIds;
	}

	/**
	 * @return the calcIntervalIds
	 */
	public Map<Integer, Long> getCalcIntervalIds() {
		return calcIntervalIds;
	}

	/**
	 * @param calcIntervalIds
	 *            the calcIntervalIds to set
	 */
	public void setCalcIntervalIds(Map<Integer, Long> calcIntervalIds) {
		this.calcIntervalIds = calcIntervalIds;
	}

	public Map<Integer, Long> getComponentPairIds() {
		return componentPairIds;
	}

	public void setComponentPairIds(Map<Integer, Long> componentPairIds) {
		this.componentPairIds = componentPairIds;
	}

	public Map<Integer, Long> getModelReferenceTypesIds() {
		return modelReferenceTypesIds;
	}

	public void setModelReferenceTypesIds(Map<Integer, Long> modelReferenceTypesIds) {
		this.modelReferenceTypesIds = modelReferenceTypesIds;
	}

	public Map<Integer, Long> getLearningActivityIds() {
		return learningActivityIds;
	}

	public void setLearningActivityIds(Map<Integer, Long> learningActivityIds) {
		this.learningActivityIds = learningActivityIds;
	}

	public Map<Integer, Long> getLearningActivityGroupIds() {
		return learningActivityGroupIds;
	}

	public void setLearningActivityGroupIds(Map<Integer, Long> learningActivityGroupIds) {
		this.learningActivityGroupIds = learningActivityGroupIds;
	}

	public Map<Integer, Long> getRealtimeEnvironmentIds() {
		return realtimeEnvironmentIds;
	}

	public void setRealtimeEnvironmentIds(Map<Integer, Long> realtimeEnvironmentIds) {
		this.realtimeEnvironmentIds = realtimeEnvironmentIds;
	}

	public Map<Integer, Long> getRealtimeActivityIds() {
		return realtimeActivityIds;
	}

	public void setRealtimeActivityIds(Map<Integer, Long> realtimeActivityIds) {
		this.realtimeActivityIds = realtimeActivityIds;
	}

	public Map<Integer, Long> getAnalysisEnvironmentIds() {
		return analysisEnvironmentIds;
	}

	public void setAnalysisEnvironmentIds(Map<Integer, Long> analysisEnvironmentIds) {
		this.analysisEnvironmentIds = analysisEnvironmentIds;
	}

	public Map<Integer, Long> getAnalysisActivityIds() {
		return analysisActivityIds;
	}

	public void setAnalysisActivityIds(Map<Integer, Long> analysisActivityIds) {
		this.analysisActivityIds = analysisActivityIds;
	}
}
