/**
 * 
 */
package cc.common.data.metadata;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "definition",
		schema = "metadata")
@SequenceGenerator(name = Definition.GENERATOR_NAME,
		sequenceName = Definition.SEQUENCE_NAME,
		allocationSize = 1)
public class Definition {

	protected static final String GENERATOR_NAME = "definition" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "definition" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(length = 100,
			nullable = false)
	private String name;

	@Column(length = 12,
			nullable = false)
	@Enumerated(EnumType.STRING)
	private ValueType type;

	@Column(nullable = false)
	private Boolean visibleAll;
	
	@Column(nullable = true)
	private Boolean range;

	public Definition() {
	}

	protected Definition(Definition definition) {
		this.id = definition.id;
		this.name = definition.name;
		this.type = definition.type;
		this.visibleAll = definition.visibleAll;
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
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the type
	 */
	public ValueType getType() {
		return type;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(ValueType type) {
		this.type = type;
	}

	/**
	 * @return the visibleAll
	 */
	public Boolean getVisibleAll() {
		return visibleAll;
	}

	/**
	 * @param visibleAll
	 *            the visibleAll to set
	 */
	public void setVisibleAll(Boolean visibleAll) {
		this.visibleAll = visibleAll;
	}

	/**
	 * @return the range
	 */
	public Boolean getRange() {
		return range;
	}

	/**
	 * @param range the range to set
	 */
	public void setRange(Boolean range) {
		this.range = range;
	}


	/* (non-Javadoc)
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (int) (id ^ (id >>> 32));
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		result = prime * result + ((range == null) ? 0 : range.hashCode());
		result = prime * result + ((type == null) ? 0 : type.hashCode());
		result = prime * result + ((visibleAll == null) ? 0 : visibleAll.hashCode());
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
		Definition other = (Definition) obj;
		if (id != other.id)
			return false;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		if (range == null) {
			if (other.range != null)
				return false;
		} else if (!range.equals(other.range))
			return false;
		if (type != other.type)
			return false;
		if (visibleAll == null) {
			if (other.visibleAll != null)
				return false;
		} else if (!visibleAll.equals(other.visibleAll))
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Definition [id=");
		sb.append(this.id).append(", name=");
		sb.append(this.name).append(", type=");
		sb.append(this.type.name()).append(", visibleAll=");
		if (this.visibleAll != null) {
			sb.append(this.visibleAll.booleanValue());
		}
		sb.append("]");
		return sb.toString();
	}
}