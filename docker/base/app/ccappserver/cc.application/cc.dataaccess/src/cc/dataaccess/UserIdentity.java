/**
 * 
 */
package cc.dataaccess;

import java.util.Calendar;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author Bryan Kowal
 */
public class UserIdentity {

	@JsonIgnore
	private Long id;

	private String email;

	private String firstName;

	private String lastName;

	private String institution;

	private String avatarUri;

	// @JsonFormat(shape = JsonFormat.Shape.STRING,
	// 		pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	// private Calendar registrationDate;

	public UserIdentity() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
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

	public String getInstitution() {
		return institution;
	}

	public void setInstitution(String institution) {
		this.institution = institution;
	}

	// public String getAvatarUri() {
	// 	return avatarUri;
	// }

	// public void setAvatarUri(String avatarUri) {
	// 	this.avatarUri = avatarUri;
	// }

	// public Calendar getRegistrationDate() {
	// 	return registrationDate;
	// }

	// public void setRegistrationDate(Calendar registrationDate) {
	// 	this.registrationDate = registrationDate;
	// }
}