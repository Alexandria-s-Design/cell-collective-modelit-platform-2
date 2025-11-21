/**
 * 
 */
package cc.common.data.user;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Table;

import cc.common.data.TCCDomain.Domain;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "user_registration_notification")
public class UserRegistrationNotification {

	// same as the user id
	@Id
	private long id;

	@Column(nullable = false,
			length = 8)
	@Enumerated(EnumType.STRING)
	private Domain domain = Domain.RESEARCH;

	@Column(nullable = false)
	private int attempts = 0;

	@Column(nullable = false)
	private Calendar creationDate;

	@Column(nullable = false)
	private Calendar updateDate;

	public UserRegistrationNotification() {
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public Domain getDomain() {
		return domain;
	}

	public void setDomain(Domain domain) {
		this.domain = domain;
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
		StringBuilder sb = new StringBuilder("UserRegistrationNotification [");
		sb.append("id=").append(id);
		if (domain != null) {
			sb.append(", domain=").append(domain.name());
		}
		sb.append(", attempts=").append(attempts);
		if (creationDate != null) {
			sb.append(", creationDate=").append(creationDate.getTime().toString());
		}
		if (updateDate != null) {
			sb.append(", updateDate=").append(updateDate.getTime().toString());
		}
		sb.append("]");
		return sb.toString();
	}
}