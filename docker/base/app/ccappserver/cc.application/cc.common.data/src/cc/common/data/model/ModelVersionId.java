/**
 * 
 */
package cc.common.data.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 * @author Bryan Kowal
 */
@Embeddable
public class ModelVersionId implements Serializable {

	private static final long serialVersionUID = -7805249975983007019L;

	@Column(nullable = false)
	private long id;

	@Column(nullable = false)
	private long version = 1;

	public ModelVersionId() {
	}

	public ModelVersionId(final long id, final long version) {
		this.id = id;
		this.version = version;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getVersion() {
		return version;
	}

	public void setVersion(long version) {
		this.version = version;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelVersionId [");
		sb.append("id=").append(id);
		sb.append(", version=").append(version);
		sb.append("]");
		return sb.toString();
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (int) (id ^ (id >>> 32));
		result = prime * result + (int) (version ^ (version >>> 32));
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ModelVersionId other = (ModelVersionId) obj;
		if (id != other.id)
			return false;
		if (version != other.version)
			return false;
		return true;
	}
}