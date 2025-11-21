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
public class ModelShareNotificationId implements Serializable {

	private static final long serialVersionUID = -4762569797383744231L;

	@Column(nullable = false)
	private long modelId;

	@Column(length = 100,
			nullable = false)
	private String email;

	public ModelShareNotificationId() {
	}

	public ModelShareNotificationId(long modelId, String email) {
		this.modelId = modelId;
		this.email = email;
	}

	public long getModelId() {
		return modelId;
	}

	public void setModelId(long modelId) {
		this.modelId = modelId;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelShareNotificationId [");
		sb.append("modelId=").append(modelId);
		sb.append(", email=").append(email);
		sb.append("]");
		return sb.toString();
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((email == null) ? 0 : email.hashCode());
		result = prime * result + (int) (modelId ^ (modelId >>> 32));
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
		ModelShareNotificationId other = (ModelShareNotificationId) obj;
		if (email == null) {
			if (other.email != null)
				return false;
		} else if (!email.equals(other.email))
			return false;
		if (modelId != other.modelId)
			return false;
		return true;
	}
}