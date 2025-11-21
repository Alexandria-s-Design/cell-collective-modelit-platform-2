/**
 * 
 */
package cc.dataaccess;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class MetadataValueRange {

	private long id;

	private long definitionId;

	private Integer position;

	private Object value;

	public MetadataValueRange() {
	}

	protected MetadataValueRange(MetadataValueRange metadataValueRange) {
		this.id = metadataValueRange.id;
		this.definitionId = metadataValueRange.definitionId;
		this.position = metadataValueRange.position;
		this.value = metadataValueRange.value;
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

	/**
	 * @return the definitionId
	 */
	public long getDefinitionId() {
		return definitionId;
	}

	/**
	 * @param definitionId
	 *            the definitionId to set
	 */
	public void setDefinitionId(long definitionId) {
		this.definitionId = definitionId;
	}

	public Integer getPosition() {
		return position;
	}

	public void setPosition(Integer position) {
		this.position = position;
	}

	/**
	 * @return the value
	 */
	public Object getValue() {
		return value;
	}

	/**
	 * @param value
	 *            the value to set
	 */
	public void setValue(Object value) {
		this.value = value;
	}
}