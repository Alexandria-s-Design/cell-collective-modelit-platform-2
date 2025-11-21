/**
 * 
 */
package cc.common.data.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;

import cc.common.data.TCCDomain.Domain;

/**
 * @author Bryan Kowal
 *
 */
@Embeddable
public class ModelDomainAccessId implements Serializable {

	private static final long serialVersionUID = -3789311134817714388L;

	@Column(nullable = false)
	private long modelId;

	@Column(nullable = false)
	private long userId;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Domain domain;

	public ModelDomainAccessId() {
	}

	public ModelDomainAccessId(long modelId, long userId, Domain domain) {
		this.modelId = modelId;
		this.userId = userId;
		this.domain = domain;
	}

	/**
	 * @return the modelId
	 */
	public long getModelId() {
		return modelId;
	}

	/**
	 * @param modelId
	 *            the modelId to set
	 */
	public void setModelId(long modelId) {
		this.modelId = modelId;
	}

	/**
	 * @return the userId
	 */
	public long getUserId() {
		return userId;
	}

	/**
	 * @param userId
	 *            the userId to set
	 */
	public void setUserId(long userId) {
		this.userId = userId;
	}

	/**
	 * @return the domain
	 */
	public Domain getDomain() {
		return domain;
	}

	/**
	 * @param domain
	 *            the domain to set
	 */
	public void setDomain(Domain domain) {
		this.domain = domain;
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
		result = prime * result + ((domain == null) ? 0 : domain.hashCode());
		result = prime * result + (int) (modelId ^ (modelId >>> 32));
		result = prime * result + (int) (userId ^ (userId >>> 32));
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
		ModelDomainAccessId other = (ModelDomainAccessId) obj;
		if (domain != other.domain)
			return false;
		if (modelId != other.modelId)
			return false;
		if (userId != other.userId)
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelDomainAccessId [");
		sb.append("modelId=").append(this.modelId);
		sb.append(", userId=").append(this.userId);
		sb.append(", domain=").append(this.domain.name());
		sb.append("]");

		return sb.toString();
	}
}