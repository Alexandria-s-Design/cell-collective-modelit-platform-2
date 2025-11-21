/**
 * 
 */
package cc.application.main.email;

import org.apache.commons.lang3.StringUtils;

import cc.common.data.model.ModelShare.SHARE_ACCESS;
import cc.common.data.user.Profile;
import cc.common.data.user.User;

/**
 * @author Bryan Kowal
 */
public class ModelShareMailContent {

	private static final String SHARING_USER_FMT = "%s (%s)";

	private static final String DEFAULT_USER = "User";

	private final Long modelId;

	private final String modelAccessLink;

	private String modelName;

	private String toAddress;

	private String replyToAddress;

	private String receivingUser;

	private String sharingUser;

	private SHARE_ACCESS shareAccess;

	public ModelShareMailContent(final Long modelId, final String modelAccessLink) {
		this.modelId = modelId;
		this.modelAccessLink = modelAccessLink;
	}

	public void setReceivingUser(final User user) {
		final Profile profile = (user == null) ? null : user.getProfile();
		this.receivingUser = (profile == null || profile.getFirstName() == null
				|| profile.getFirstName().trim().isEmpty()) ? DEFAULT_USER : profile.getFirstName();
	}

	public void setSharingUser(final Profile profile) {
		final String firstName = (profile.getFirstName() == null) ? StringUtils.EMPTY : profile.getFirstName().trim();
		final String lastName = (profile.getLastName() == null) ? StringUtils.EMPTY : profile.getLastName().trim();
		String username = "a user";
		if (!firstName.isEmpty() && lastName.isEmpty()) {
			username = firstName;
		} else if (firstName.isEmpty() && !lastName.isEmpty()) {
			username = lastName;
		} else if (!firstName.isEmpty() && !lastName.isEmpty()) {
			username = firstName + " " + lastName;
		}
		this.sharingUser = String.format(SHARING_USER_FMT, username, profile.getEmail());
	}

	public String getModelName() {
		return modelName;
	}

	public void setModelName(String modelName) {
		this.modelName = modelName;
	}

	public String getToAddress() {
		return toAddress;
	}

	public void setToAddress(String toAddress) {
		this.toAddress = toAddress;
	}

	public String getReplyToAddress() {
		return replyToAddress;
	}

	public void setReplyToAddress(String replyToAddress) {
		this.replyToAddress = replyToAddress;
	}

	public String getReceivingUser() {
		return receivingUser;
	}

	public void setReceivingUser(String receivingUser) {
		this.receivingUser = receivingUser;
	}

	public String getSharingUser() {
		return sharingUser;
	}

	public void setSharingUser(String sharingUser) {
		this.sharingUser = sharingUser;
	}

	public SHARE_ACCESS getShareAccess() {
		return shareAccess;
	}

	public void setShareAccess(SHARE_ACCESS shareAccess) {
		this.shareAccess = shareAccess;
	}

	public Long getModelId() {
		return modelId;
	}

	public String getModelAccessLink() {
		return modelAccessLink;
	}
}