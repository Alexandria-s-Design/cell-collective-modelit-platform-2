/**
 * 
 */
package cc.common.data.user;

import java.io.Serializable;
import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.IdManagementConstants;

/**
 * @author bkowal
 *
 */
@Entity
@Table(name = "registration")
@SequenceGenerator(name = Registration.GENERATOR_NAME,
		sequenceName = Registration.SEQUENCE_NAME,
		allocationSize = 1)
public class Registration implements Serializable {

	private static final long serialVersionUID = -8906290768245511776L;

	protected static final String GENERATOR_NAME = "registration" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "registration" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@OneToOne(optional = false,
			fetch = FetchType.EAGER)
	private User user;

	@Column(length = 60,
			nullable = false)
	private String activationCode;

	@Column(nullable = false)
	private Calendar registrationDate;

	@Column(nullable = true)
	private Calendar activationDate;

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

	/**
	 * @return the activationCode
	 */
	public String getActivationCode() {
		return activationCode;
	}

	/**
	 * @param activationCode
	 *            the activationCode to set
	 */
	public void setActivationCode(String activationCode) {
		this.activationCode = activationCode;
	}

	/**
	 * @return the registrationDate
	 */
	public Calendar getRegistrationDate() {
		return registrationDate;
	}

	/**
	 * @param registrationDate
	 *            the registrationDate to set
	 */
	public void setRegistrationDate(Calendar registrationDate) {
		this.registrationDate = registrationDate;
	}

	/**
	 * @return the activationDate
	 */
	public Calendar getActivationDate() {
		return activationDate;
	}

	/**
	 * @param activationDate
	 *            the activationDate to set
	 */
	public void setActivationDate(Calendar activationDate) {
		this.activationDate = activationDate;
	}
}