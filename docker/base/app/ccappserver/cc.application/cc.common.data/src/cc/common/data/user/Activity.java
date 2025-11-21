/**
 * 
 */
package cc.common.data.user;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.IdManagementConstants;

/**
 * @author bkowal
 *
 */
@Entity
@Table(name = "activity")
@SequenceGenerator(name = Activity.GENERATOR_NAME,
		sequenceName = Activity.SEQUENCE_NAME,
		allocationSize = 1)
public class Activity {

	protected static final String GENERATOR_NAME = "activity" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "activity" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private Calendar loginDate;

	@JoinColumn(name = "user_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_activity_to_user") )
	@ManyToOne(optional = false,
			fetch = FetchType.EAGER)
	private User user;

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
	 * @return the loginDate
	 */
	public Calendar getLoginDate() {
		return loginDate;
	}

	/**
	 * @param loginDate
	 *            the loginDate to set
	 */
	public void setLoginDate(Calendar loginDate) {
		this.loginDate = loginDate;
	}

	/**
	 * @return the user
	 */
	public User getUser() {
		return user;
	}

	/**
	 * @param user
	 *            the user to set
	 */
	public void setUser(User user) {
		this.user = user;
	}
}