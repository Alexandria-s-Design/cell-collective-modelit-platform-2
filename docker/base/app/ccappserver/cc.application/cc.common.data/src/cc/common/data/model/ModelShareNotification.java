/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Table;

import cc.common.data.TCCDomain.Domain;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_share_notification")
public class ModelShareNotification {

	@EmbeddedId
	private ModelShareNotificationId id;

	@Column(nullable = false)
	private long modelShareId;

	@Column(nullable = true, length = 9)
	@Enumerated(EnumType.STRING)
	private Domain domain;

	/*
	 * The id of the user that shared the Model.
	 */
	@Column(nullable = false)
	private Long userId;

	@Column(nullable = false)
	private int attempts = 0;

	@Column(nullable = false)
	private Calendar creationDate;

	@Column(nullable = false)
	private Calendar updateDate;

	public ModelShareNotification() {
	}

	public ModelShareNotification(ModelShareNotificationId id) {
		this.id = id;
	}

	public ModelShareNotificationId getId() {
		return id;
	}

	public void setId(ModelShareNotificationId id) {
		this.id = id;
	}

	public long getModelShareId() {
		return modelShareId;
	}

	public void setModelShareId(long modelShareId) {
		this.modelShareId = modelShareId;
	}

	public Domain getDomain() {
		return domain;
	}

	public void setDomain(Domain domain) {
		this.domain = domain;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public int getAttempts() {
		return attempts;
	}

	public void setAttempts(int attempts) {
		this.attempts = attempts;
	}

	public Calendar getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	public Calendar getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Calendar updateDate) {
		this.updateDate = updateDate;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelShareNotification [");
		sb.append("id=").append(id.toString());
		sb.append(", modelShareId=").append(modelShareId);
		if (domain != null) {
			sb.append(", domain=").append(domain.name());
		}
		sb.append(", userId=").append(userId);
		sb.append(", attempts=").append(attempts);
		sb.append(", creationDate=").append(creationDate.getTime().toString());
		sb.append(", updateDate=").append(updateDate.getTime().toString());
		sb.append("]");
		return sb.toString();
	}
}