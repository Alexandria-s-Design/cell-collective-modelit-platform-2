/**
 * 
 */
package cc.common.data.user;

import java.io.Serializable;
import java.util.List;

import javax.persistence.*;

import cc.common.data.transitory.UserDomainAccess;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author bkowal
 *
 */
@JsonInclude(Include.NON_NULL)
@Entity
@SequenceGenerator(name = Profile.GENERATOR_NAME,
		sequenceName = Profile.SEQUENCE_NAME,
		allocationSize = 1)
public class Profile implements Serializable {

	private static final long serialVersionUID = 4588855344805626138L;

	protected static final String GENERATOR_NAME = "profile" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "profile" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@OneToOne(optional = false,
			cascade = CascadeType.ALL,
			orphanRemoval = true,
			fetch = FetchType.EAGER)
	private User user;

	@ClientEditableField
	@Column(length = 100,
			nullable = false)
	private String email;

	@ClientEditableField
	@Column(length = 40,
			nullable = true)
	private String firstName;

	@ClientEditableField
	@Column(length = 60,
			nullable = true)
	private String lastName;

	@ClientEditableField
	@Column(length = 150,
			nullable = true)
	private String institution;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "institution_id", referencedColumnName = "id", nullable = true)
	private Institutions institutionObj;

	// @ClientEditableField
	// @Column(length = 2500,
	// 		nullable = true)
	// private String avatarUri;

	@Transient
	private UserDomainAccess userDomainAccess;

	@Transient
	private List<AuthorityRequest> activeAuthorityRequests;

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
	@JsonIgnore
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
	 * @return the email
	 */
	public String getEmail() {
		return email;
	}

	// /**
	//  * @param avatarUri
	//  *            the avatarUri to set
	//  */
	// public void setAvatarUri(String avatarUri) {
	// 	this.avatarUri = avatarUri;
	// }

	// /**
	//  * @return the avatarUri
	//  */
	// public String getAvatarUri() {
	// 	return avatarUri;
	// }

	/**
	 * @param email
	 *            the email to set
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * @return the firstName
	 */
	public String getFirstName() {
		return firstName;
	}

	/**
	 * @param firstName
	 *            the firstName to set
	 */
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	/**
	 * @return the lastName
	 */
	public String getLastName() {
		return lastName;
	}

	/**
	 * @param lastName
	 *            the lastName to set
	 */
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	/**
	 * @return the institution
	 */
	public String getInstitution() {
		return institutionObj != null ? institutionObj.getName() : institution;
	}

	/**
	 * @param institution
	 *            the institution to set
	 */
	public void setInstitution(String institution) {
		this.institution = institution;
	}

	/**
	 * Domain access for cellcollective teach, learn, research
	 * @return
	 */
	public UserDomainAccess getUserDomainAccess() { return this.userDomainAccess; }
	public void setUserDomainAccess(UserDomainAccess uda) { this.userDomainAccess = uda; }

	public List<AuthorityRequest> getActiveAuthorityRequests() { return this.activeAuthorityRequests; }
	public void setActiveAuthorityRequests(List<AuthorityRequest> activeAuthorityRequests) { this.activeAuthorityRequests = activeAuthorityRequests; }
}