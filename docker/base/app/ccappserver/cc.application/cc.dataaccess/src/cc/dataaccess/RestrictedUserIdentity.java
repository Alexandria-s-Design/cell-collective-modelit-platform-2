/**
 * 
 */
package cc.dataaccess;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author Bryan Kowal
 */
public class RestrictedUserIdentity {

	@JsonIgnore
	private Long id;

	private String firstName;

	private String lastName;

	public RestrictedUserIdentity() {
	}

	public RestrictedUserIdentity(UserIdentity userIdentity) {
		this.id = userIdentity.getId();
		this.firstName = userIdentity.getFirstName();
		this.lastName = userIdentity.getLastName();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
}