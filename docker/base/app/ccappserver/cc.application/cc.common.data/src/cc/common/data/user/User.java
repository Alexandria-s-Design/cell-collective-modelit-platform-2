/**
 * 
 */
package cc.common.data.user;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.IdManagementConstants;

/**
 * @author bkowal
 *
 */
@Entity
@Table(name = "[user]")
@SequenceGenerator(name = User.GENERATOR_NAME,
		sequenceName = User.SEQUENCE_NAME,
		allocationSize = 1)
public class User {

	protected static final String GENERATOR_NAME = "user" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "user" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(length = 120,
			nullable = false)
	private String password;

	@Column(nullable = false)
	private boolean enabled = false;

	@JoinTable(name = "authority",
			joinColumns = @JoinColumn(name = "user_id",
					referencedColumnName = "id") ,
			inverseJoinColumns = @JoinColumn(name = "role_id",
					referencedColumnName = "id") )
	@ManyToMany(fetch = FetchType.EAGER)
	private Set<Role> authorities;

	@OneToOne(optional = false,
			cascade = CascadeType.ALL,
			orphanRemoval = true,
			mappedBy = "user",
			fetch = FetchType.EAGER)
	private Profile profile;

	@OneToOne(optional = false,
			cascade = CascadeType.ALL,
			fetch = FetchType.LAZY,
			orphanRemoval = true,
			mappedBy = "user")
	private Registration registration;

	@OneToMany(cascade = CascadeType.ALL,
			fetch = FetchType.LAZY,
			orphanRemoval = true)
	@JoinColumn(name = "user_id",
			insertable = false,
			nullable = true,
			updatable = false)
	private Set<Activity> userActivity;

	public void addUserRole(final Role role) {
		if (this.authorities == null) {
			this.authorities = new HashSet<>();
		}
		this.authorities.add(role);
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
	 * @return the password
	 */
	public String getPassword() {
		return password;
	}

	/**
	 * @param password
	 *            the password to set
	 */
	public void setPassword(String password) {
		this.password = password;
	}

	/**
	 * @return the enabled
	 */
	public boolean isEnabled() {
		return enabled;
	}

	/**
	 * @param enabled
	 *            the enabled to set
	 */
	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	/**
	 * @return the authorities
	 */
	public Set<Role> getAuthorities() {
		return authorities;
	}

	/**
	 * @param authorities
	 *            the authorities to set
	 */
	public void setAuthorities(Set<Role> authorities) {
		this.authorities = authorities;
	}

	/**
	 * @return the profile
	 */
	public Profile getProfile() {
		return profile;
	}

	/**
	 * @param profile
	 *            the profile to set
	 */
	public void setProfile(Profile profile) {
		this.profile = profile;
	}

	/**
	 * @return the registration
	 */
	public Registration getRegistration() {
		return registration;
	}

	/**
	 * @param registration
	 *            the registration to set
	 */
	public void setRegistration(Registration registration) {
		this.registration = registration;
	}

	/**
	 * @return the userActivity
	 */
	public Set<Activity> getUserActivity() {
		return userActivity;
	}

	/**
	 * @param userActivity
	 *            the userActivity to set
	 */
	public void setUserActivity(Set<Activity> userActivity) {
		this.userActivity = userActivity;
	}
}