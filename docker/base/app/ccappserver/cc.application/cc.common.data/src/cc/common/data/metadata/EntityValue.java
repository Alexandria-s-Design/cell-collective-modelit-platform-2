/**
 * 
 */
package cc.common.data.metadata;

import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "entity_value",
		schema = "metadata")
public class EntityValue {

	@EmbeddedId
	private EntityValueId id;

	@Transient
	private Definition definition;
	
	@Transient
	private int jsId;

	public EntityValue() {
	}

	public EntityValue(long entity_id, long value_id) {
		this.id = new EntityValueId(entity_id, value_id);
	}

	public EntityValue(long entity_id, long value_id, Definition definition, int jsId) {
		this.id = new EntityValueId(entity_id, value_id);
		this.definition = definition;
		this.jsId = jsId;
	}

	/**
	 * @return the id
	 */
	public EntityValueId getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(EntityValueId id) {
		this.id = id;
	}

	/**
	 * @return the definition
	 */
	public Definition getDefinition() {
		return definition;
	}

	/**
	 * @param definition
	 *            the definition to set
	 */
	public void setDefinition(Definition definition) {
		this.definition = definition;
	}

	/**
	 * @return the jsId
	 */
	public int getJsId() {
		return jsId;
	}

	/**
	 * @param jsId the jsId to set
	 */
	public void setJsId(int jsId) {
		this.jsId = jsId;
	}
}