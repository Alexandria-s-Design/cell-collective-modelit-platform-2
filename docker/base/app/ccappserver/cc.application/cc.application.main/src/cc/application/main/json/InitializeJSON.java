/**
 * 
 */
package cc.application.main.json;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonFormat;

import cc.application.main.json.metadata.DefinitionJSON;
import cc.application.main.json.metadata.MetadataValueRangeJSON;
import cc.common.data.model.ModelDomainAccess;

/**
 * @author Bryan Kowal
 */
public class InitializeJSON {

	private Map<Long, DefinitionJSON> definitionMap = new HashMap<>();

	private Map<Long, MetadataValueRangeJSON> metadataValueRangeMap = new HashMap<>();

	private Map<Long, UploadJSON> uploadMap = new HashMap<>();

	private List<ModelDomainAccess> modelDomainAccessList = new ArrayList<>();
	
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar subscriptionExpires;

	public InitializeJSON() {
	}

	public InitializeJSON(final Map<Long, DefinitionJSON> allDefinitionsJSON,
			final Map<Long, MetadataValueRangeJSON> allMetadataValueRangesJSON, final Map<Long, UploadJSON> uploadMap,
			List<ModelDomainAccess> modelDomainAccessList, final Calendar subscriptionExpires) {
		this.definitionMap = allDefinitionsJSON;
		this.metadataValueRangeMap = allMetadataValueRangesJSON;
		this.uploadMap = uploadMap;
		this.modelDomainAccessList = modelDomainAccessList;
		this.subscriptionExpires = subscriptionExpires;
	}

	/**
	 * @return the definitionMap
	 */
	public Map<Long, DefinitionJSON> getDefinitionMap() {
		return definitionMap;
	}

	/**
	 * @param definitionMap
	 *            the definitionMap to set
	 */
	public void setDefinitionMap(Map<Long, DefinitionJSON> definitionMap) {
		this.definitionMap = definitionMap;
	}

	/**
	 * @return the metadataValueRangeMap
	 */
	public Map<Long, MetadataValueRangeJSON> getMetadataValueRangeMap() {
		return metadataValueRangeMap;
	}

	/**
	 * @param metadataValueRangeMap
	 *            the metadataValueRangeMap to set
	 */
	public void setMetadataValueRangeMap(Map<Long, MetadataValueRangeJSON> metadataValueRangeMap) {
		this.metadataValueRangeMap = metadataValueRangeMap;
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
	 * @return the modelDomainAccessList
	 */
	public List<ModelDomainAccess> getModelDomainAccessList() {
		return modelDomainAccessList;
	}

	/**
	 * @param modelDomainAccessList
	 *            the modelDomainAccessList to set
	 */
	public void setModelDomainAccessList(List<ModelDomainAccess> modelDomainAccessList) {
		this.modelDomainAccessList = modelDomainAccessList;
	}

	public Calendar getSubscriptionExpires() {
		return subscriptionExpires;
	}

	public void setSubscriptionExpires(Calendar subscriptionExpires) {
		this.subscriptionExpires = subscriptionExpires;
	}
}