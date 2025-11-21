/**
 * 
 */
package cc.application.main.json;

import java.util.Map;

import cc.application.main.json.metadata.EntityMetadataRangeJSON;
import cc.application.main.json.metadata.EntityMetadataValueJSON;

/**
 * @author Bryan
 */
public class ViewableModel {

	private ModelJSON model;

	private ModelPermissions modelPermissions;

	private String hash;

	private Map<Long, EntityMetadataValueJSON> metadataValueMap;

	private Map<String, EntityMetadataRangeJSON> metadataRangeMap;

	private Map<Long, UploadJSON> uploadMap;
	
	private Map<Long, LearningActivityJSON> learningActivityMap;

	private Map<Long, LearningActivityGroupJSON> learningActivityGroupMap;

	public ViewableModel() {
	}

	public ViewableModel(ModelJSON model, ModelPermissions modelPermissions, String hash,
			Map<Long, EntityMetadataValueJSON> metadataValueMap, Map<String, EntityMetadataRangeJSON> metadataRangeMap,
			Map<Long, UploadJSON> uploadMap, Map<Long, LearningActivityJSON> learningActivityMap, Map<Long, LearningActivityGroupJSON> learningActivityGroupMap) {
		this.model = model;
		this.modelPermissions = modelPermissions;
		this.hash = hash;
		this.metadataValueMap = metadataValueMap;
		this.metadataRangeMap = metadataRangeMap;
		this.uploadMap = uploadMap;
		this.learningActivityMap = learningActivityMap;
		this.learningActivityGroupMap = learningActivityGroupMap;
	}

	/**
	 * @return the model
	 */
	public ModelJSON getModel() {
		return model;
	}

	/**
	 * @param model
	 *            the model to set
	 */
	public void setModel(ModelJSON model) {
		this.model = model;
	}

	/**
	 * @return the modelPermissions
	 */
	public ModelPermissions getModelPermissions() {
		return modelPermissions;
	}

	/**
	 * @param modelPermissions
	 *            the modelPermissions to set
	 */
	public void setModelPermissions(ModelPermissions modelPermissions) {
		this.modelPermissions = modelPermissions;
	}

	/**
	 * @return the hash
	 */
	public String getHash() {
		return hash;
	}

	/**
	 * @param hash
	 *            the hash to set
	 */
	public void setHash(String hash) {
		this.hash = hash;
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

}