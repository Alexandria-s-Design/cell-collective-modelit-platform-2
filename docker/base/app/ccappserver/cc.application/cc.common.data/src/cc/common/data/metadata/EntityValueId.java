/**
 * 
 */
package cc.common.data.metadata;

import java.io.Serializable;

import javax.persistence.Embeddable;

/**
 * @author Bryan Kowal
 */
@Embeddable
public class EntityValueId implements Serializable {

	private static final long serialVersionUID = -1408883820876758375L;

	private long entity_id;

	private long value_id;

	public EntityValueId() {
	}

	public EntityValueId(long entity_id, long value_id) {
		this.entity_id = entity_id;
		this.value_id = value_id;
	}

	/**
	 * @return the entity_id
	 */
	public long getEntity_id() {
		return entity_id;
	}

	/**
	 * @param entity_id
	 *            the entity_id to set
	 */
	public void setEntity_id(long entity_id) {
		this.entity_id = entity_id;
	}

	/**
	 * @return the value_id
	 */
	public long getValue_id() {
		return value_id;
	}

	/**
	 * @param value_id
	 *            the value_id to set
	 */
	public void setValue_id(long value_id) {
		this.value_id = value_id;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (int) (entity_id ^ (entity_id >>> 32));
		result = prime * result + (int) (value_id ^ (value_id >>> 32));
		return result;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		EntityValueId other = (EntityValueId) obj;
		if (entity_id != other.entity_id)
			return false;
		if (value_id != other.value_id)
			return false;
		return true;
	}
}