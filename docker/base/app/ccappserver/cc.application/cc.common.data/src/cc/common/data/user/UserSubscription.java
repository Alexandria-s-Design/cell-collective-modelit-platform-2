/**
 * 
 */
package cc.common.data.user;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
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
@Table(name = "user_subscription")
@SequenceGenerator(name = UserSubscription.GENERATOR_NAME,
		sequenceName = UserSubscription.SEQUENCE_NAME,
		allocationSize = 1)
public class UserSubscription {

	protected static final String GENERATOR_NAME = "user_subscription" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "user_subscription" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long userId;

	@Column(nullable = false)
	private Calendar creationDate;

	@Column(nullable = false)
	private Calendar expirationDate;

	@Column(nullable = false)
	private long modelsSubmitted = 0;

	public UserSubscription() {
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public Calendar getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	public Calendar getExpirationDate() {
		return expirationDate;
	}

	public void setExpirationDate(Calendar expirationDate) {
		this.expirationDate = expirationDate;
	}

	public long getModelsSubmitted() {
		return modelsSubmitted;
	}

	public void setModelsSubmitted(long modelsSubmitted) {
		this.modelsSubmitted = modelsSubmitted;
	}
}