/**
 * 
 */
package cc.application.main.json.metadata;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.metadata.Definition;
import cc.dataaccess.MetadataValueRange;

/**
 * @author Bryan Kowal
 *
 */
public class MetadataValueRangeJSON extends MetadataValueRange {

	private Definition associatedDefinition;

	private MetadataValueRange metadataValueRange;

	public MetadataValueRangeJSON() {
	}

	public MetadataValueRangeJSON(MetadataValueRange metadataValueRange) {
		super(metadataValueRange);
		this.metadataValueRange = metadataValueRange;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	/**
	 * @return the associatedDefinition
	 */
	@JsonIgnore
	public Definition getAssociatedDefinition() {
		return associatedDefinition;
	}

	/**
	 * @param associatedDefinition
	 *            the associatedDefinition to set
	 */
	public void setAssociatedDefinition(Definition associatedDefinition) {
		this.associatedDefinition = associatedDefinition;
	}

	/**
	 * @return the metadataValueRange
	 */
	@JsonIgnore
	public MetadataValueRange getMetadataValueRange() {
		return metadataValueRange;
	}

	/**
	 * @param metadataValueRange
	 *            the metadataValueRange to set
	 */
	public void setMetadataValueRange(MetadataValueRange metadataValueRange) {
		this.metadataValueRange = metadataValueRange;
	}
}