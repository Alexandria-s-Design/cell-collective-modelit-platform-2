/**
 * 
 */
package cc.common.data.metadata;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.Transient;

import cc.common.data.ClientEditableField;

/**
 * @author Bryan Kowal
 */
@MappedSuperclass
public abstract class AbstractSetValue<T> {

	@Id
	@Column(name = "value_id")
	private long valueId;

	@ClientEditableField
	@Column(nullable = true)
	private T value;

	@Transient
	private Value parent;

	public AbstractSetValue() {
	}

	/**
	 * @return the valueId
	 */
	public long getValueId() {
		return valueId;
	}

	/**
	 * @param valueId
	 *            the valueId to set
	 */
	public void setValueId(long valueId) {
		this.valueId = valueId;
	}

	/**
	 * @return the value
	 */
	public T getValue() {
		return value;
	}

	/**
	 * @param value
	 *            the value to set
	 */
	public void setValue(T value) {
		this.value = value;
	}

	/**
	 * @return the parent
	 */
	public Value getParent() {
		return parent;
	}

	/**
	 * @param parent
	 *            the parent to set
	 */
	public void setParent(Value parent) {
		this.parent = parent;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((value == null) ? 0 : value.hashCode());
		result = prime * result + (int) (valueId ^ (valueId >>> 32));
		return result;
	}

	/*
	 * (non-Javadoc)
	 * 
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
		AbstractSetValue<?> other = (AbstractSetValue<?>) obj;
		if (value == null) {
			if (other.value != null)
				return false;
		} else if (!value.equals(other.value))
			return false;
		if (valueId != other.valueId)
			return false;
		return true;
	}
}