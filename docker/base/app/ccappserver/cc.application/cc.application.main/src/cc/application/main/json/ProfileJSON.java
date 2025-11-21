/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.user.Profile;

/**
 * @author Bryan Kowal
 *
 */
public class ProfileJSON extends Profile implements INullableFields {

	private static class NullableFields {
		public static String FIRST_NAME = "firstName";

		public static String LAST_NAME = "lastName";

		public static String INSTITUTION = "institution";

		// public static String AVATAR_URI = "avatarUri";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	private static final long serialVersionUID = 841012373683189516L;

	public ProfileJSON() {
	}

	@Override
	public void setFirstName(String firstName) {
		super.setFirstName(firstName);
		nullableFields.handleNullSet(firstName, NullableFields.FIRST_NAME);
	}

	@Override
	public void setLastName(String lastName) {
		super.setLastName(lastName);
		nullableFields.handleNullSet(lastName, NullableFields.LAST_NAME);
	}

	@Override
	public void setInstitution(String institution) {
		super.setInstitution(institution);
		nullableFields.handleNullSet(institution, NullableFields.INSTITUTION);
	}

	// @Override
	// public void setAvatarUri(String avatarUri) {
	// 	super.setAvatarUri(avatarUri);
	// 	nullableFields.handleNullSet(avatarUri, NullableFields.AVATAR_URI);
	// }

	@Override
	public boolean wasSetNull(String fieldName) {
		return nullableFields.wasSetNull(fieldName);
	}
}