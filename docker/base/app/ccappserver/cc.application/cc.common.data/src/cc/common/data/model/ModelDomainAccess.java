/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;

import cc.common.data.TCCDomain.Domain;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_domain_access")
public class ModelDomainAccess {

	@EmbeddedId
	private ModelDomainAccessId id;

	@Column(nullable = true)
	private Long modelLinkId;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate = Calendar.getInstance();

	public ModelDomainAccess() {
	}

	public ModelDomainAccess(long modelId, long userId, Domain domain) {
		this.id = new ModelDomainAccessId(modelId, userId, domain);
	}

	/**
	 * @return the id
	 */
	public ModelDomainAccessId getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(ModelDomainAccessId id) {
		this.id = id;
	}

	/**
	 * @return the modelLinkId
	 */
	public Long getModelLinkId() {
		return modelLinkId;
	}

	/**
	 * @param modelLinkId
	 *            the modelLinkId to set
	 */
	public void setModelLinkId(Long modelLinkId) {
		this.modelLinkId = modelLinkId;
	}

	/**
	 * @return the creationDate
	 */
	public Calendar getCreationDate() {
		return creationDate;
	}

	/**
	 * @param creationDate
	 *            the creationDate to set
	 */
	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelDomainAccess [");
		sb.append("id=").append(this.id.toString());
		if (modelLinkId != null) {
			sb.append(", modelLinkId=").append(modelLinkId);
		}
		sb.append(", creationDate=").append(this.creationDate.getTime().toString());
		sb.append("]");

		return sb.toString();
	}
}