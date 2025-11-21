/**
 * 
 */
package cc.application.main.json;

import java.util.Map;

import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class FilteredModelChangesetMap extends ModelBiologicMap {

	public FilteredModelChangesetMap(ModelBiologicMap modelBiologicMap) {
		super(modelBiologicMap);
		if (CollectionUtils.isEmpty(this.getSpeciesMap())) {
			this.setSpeciesMap(null);
		}
		if (CollectionUtils.isEmpty(this.getRegulatorMap())) {
			this.setRegulatorMap(null);
		}
		if (CollectionUtils.isEmpty(this.getDominanceMap())) {
			this.setDominanceMap(null);
		}
		if (CollectionUtils.isEmpty(this.getConditionMap())) {
			this.setConditionMap(null);
		}
		if (CollectionUtils.isEmpty(this.getConditionSpeciesMap())) {
			this.setConditionSpeciesMap(null);
		}
		if (CollectionUtils.isEmpty(this.getSubConditionMap())) {
			this.setSubConditionMap(null);
		}
		if (CollectionUtils.isEmpty(this.getSubConditionSpeciesMap())) {
			this.setSubConditionSpeciesMap(null);
		}
		if (CollectionUtils.isEmpty(this.getInitialStateMap())) {
			this.setInitialStateMap(null);
		}
		if (CollectionUtils.isEmpty(this.getInitialStateSpeciesMap())) {
			this.setInitialStateSpeciesMap(null);
		}
		if (CollectionUtils.isEmpty(this.getModelReferenceMap())) {
			this.setModelReferenceMap(null);
		}
		if (CollectionUtils.isEmpty(this.getReferenceMap())) {
			this.setReferenceMap(null);
		}
		if (CollectionUtils.isEmpty(this.getPageMap())) {
			this.setPageMap(null);
		}
		if (CollectionUtils.isEmpty(this.getPageReferenceMap())) {
			this.setPageReferenceMap(null);
		}
		if (CollectionUtils.isEmpty(this.getPageMap())) {
			this.setPageMap(null);
		}
		if (CollectionUtils.isEmpty(this.getPageReferenceMap())) {
			this.setPageReferenceMap(null);
		}
		if (CollectionUtils.isEmpty(this.getSectionMap())) {
			this.setSectionMap(null);
		}
		if (CollectionUtils.isEmpty(this.getContentMap())) {
			this.setContentMap(null);
		}
		if (CollectionUtils.isEmpty(this.getContentReferenceMap())) {
			this.setContentReferenceMap(null);
		}
		if (CollectionUtils.isEmpty(this.getModelReferenceTypesMap())) {
			this.setModelReferenceTypesMap(null);
		}
		if (modelBiologicMap.modelUpdated()) {
			this.setName(modelBiologicMap.getName());
			this.setDescription(modelBiologicMap.getDescription());
			this.setTags(modelBiologicMap.getTags());
			this.setAuthor(modelBiologicMap.getAuthor());
			this.setPublished(modelBiologicMap.isPublished());
			this.setInitialStateId(modelBiologicMap.getInitialStateId());
		}
	}

	/**
	 * boolean value indicating whether or not this changeset has model-biologic
	 * relevance (ex: species changes, regulator changes and not initial state
	 * or experiment changes).
	 * 
	 * @return {@code true} when the changeset does have model-biologic
	 *         relevance; false, otherwise.
	 */
	public boolean validModelChangeset() {
		return this.modelUpdated() || CollectionUtils.isEmpty(this.getSpeciesMap()) == false
				|| CollectionUtils.isEmpty(this.getRegulatorMap()) == false
				|| CollectionUtils.isEmpty(this.getDominanceMap()) == false
				|| CollectionUtils.isEmpty(this.getConditionMap()) == false
				|| CollectionUtils.isEmpty(this.getConditionSpeciesMap()) == false
				|| CollectionUtils.isEmpty(this.getSubConditionMap()) == false
				|| CollectionUtils.isEmpty(this.getSubConditionSpeciesMap()) == false
				|| CollectionUtils.isEmpty(this.getInitialStateMap()) == false
				|| CollectionUtils.isEmpty(this.getInitialStateSpeciesMap()) == false
				|| CollectionUtils.isEmpty(this.getModelReferenceMap()) == false
				|| CollectionUtils.isEmpty(this.getReferenceMap()) == false
				|| CollectionUtils.isEmpty(this.getPageMap()) == false
				|| CollectionUtils.isEmpty(this.getPageReferenceMap()) == false
				|| CollectionUtils.isEmpty(this.getSectionMap()) == false
				|| CollectionUtils.isEmpty(this.getContentMap()) == false
				|| CollectionUtils.isEmpty(this.getContentReferenceMap()) == false;
	}

	public boolean containsBiologicChanges() {
		return this.modelUpdated() || CollectionUtils.isEmpty(this.getSpeciesMap()) == false
				|| CollectionUtils.isEmpty(this.getRegulatorMap()) == false
				|| CollectionUtils.isEmpty(this.getDominanceMap()) == false
				|| CollectionUtils.isEmpty(this.getConditionMap()) == false
				|| CollectionUtils.isEmpty(this.getConditionSpeciesMap()) == false
				|| CollectionUtils.isEmpty(this.getSubConditionMap()) == false
				|| CollectionUtils.isEmpty(this.getSubConditionSpeciesMap()) == false
				|| CollectionUtils.isEmpty(this.getModelReferenceMap()) == false
				|| CollectionUtils.isEmpty(this.getReferenceMap()) == false;
	}

	public boolean containsKnowledgeBaseChanges() {
		return CollectionUtils.isEmpty(this.getReferenceMap()) == false
				|| CollectionUtils.isEmpty(this.getPageMap()) == false
				|| CollectionUtils.isEmpty(this.getPageReferenceMap()) == false
				|| CollectionUtils.isEmpty(this.getSectionMap()) == false
				|| CollectionUtils.isEmpty(this.getContentMap()) == false
				|| CollectionUtils.isEmpty(this.getContentReferenceMap()) == false;
	}

	@JsonIgnore
	@Override
	public Rating getModelRating() {
		return super.getModelRating();
	}

	@JsonIgnore
	@Override
	public Map<Long, ModelCommentMap> getModelCommentMap() {
		return super.getModelCommentMap();
	}

	@JsonIgnore
	@Override
	public Map<Long, ModelShareMap> getShareMap() {
		return super.getShareMap();
	}

	@JsonIgnore
	@Override
	public Map<Long, ModelLinkJSON> getLinkMap() {
		return super.getLinkMap();
	}

	@JsonIgnore
	@Override
	public ModelPermissions getPermissions() {
		return super.getPermissions();
	}

	@JsonIgnore
	@Override
	public Map<Long, ExperimentMap> getExperimentMap() {
		return super.getExperimentMap();
	}
}