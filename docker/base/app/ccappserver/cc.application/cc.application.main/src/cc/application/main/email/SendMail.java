/**
 * 
 */
package cc.application.main.email;

import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMessage.RecipientType;

import org.springframework.beans.factory.annotation.Autowired;


import org.apache.http.HttpEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import cc.application.main.WebServiceUtil;
import cc.common.data.model.ModelShare.SHARE_ACCESS;
import cc.common.data.user.AuthorityRequest;
import cc.common.data.user.Profile;
import cc.common.data.user.Role;
import cc.common.data.user.UserRegistrationNotification;
import cc.dataaccess.user.dao.UserDao;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Bryan Kowal
 */
public class SendMail {

	private static final String HEADER_LOGO_IMAGE_LINK = WebServiceUtil.getenv("HEADER_LOGO_IMAGE", "https://cellcollective.org/assets/img/logo/base-title-inverse.png");
	private static final String HEADER_LOGO_IMAGE = "<img src=\"" + HEADER_LOGO_IMAGE_LINK + "\" height=\"90\" />";

	protected SendMail() {
	}

	public static void sendPasswordReset(final String email, final String generatedPassword) throws Exception {
		Session session = Session.getDefaultInstance(MailSettings.getMailProperties(),
				MailSettings.getMailAuthenticator());

		// create a message
		Message msg = new MimeMessage(session);

		// set the from and to address
		InternetAddress addressFrom = new InternetAddress(MailSettings.FROM_ADDRESS);
		msg.setFrom(addressFrom);
		InternetAddress addressTo = new InternetAddress(email);
		msg.setRecipient(RecipientType.TO, addressTo);
		msg.setSubject("ModelIt! Password Reset");

		StringBuilder sb = new StringBuilder("Welcome to ModelIt! 2.1.0: ").append(email).append("\n\n");
		sb.append(
				"A new password has been generated for you. After logging in with the generated password, we recommend that you change your password immediately.\n");
		sb.append(
				"You can change your password by positioning your mouse over the icon next to your name on the right, and selecting 'Change Password' in the menu.");
		sb.append("\n\nGenerated Password: ").append(generatedPassword).append("\n");

		msg.setContent(sb.toString(), "text/plain");
		Transport.send(msg);
	}

	public static void sendModelShareNotification(final ModelShareMailContent modelShareMailContent) throws Exception {
		Session session = Session.getDefaultInstance(MailSettings.getMailProperties(),
				MailSettings.getMailAuthenticator());

		// create a message
		Message msg = new MimeMessage(session);

		// set the from and to address
		InternetAddress addressFrom = new InternetAddress(MailSettings.FROM_ADDRESS);
		msg.setFrom(addressFrom);
		InternetAddress addressTo = new InternetAddress(modelShareMailContent.getToAddress());
		msg.setRecipient(RecipientType.TO, addressTo);
		msg.setSubject("Model Share Notification for: " + modelShareMailContent.getModelName());
		msg.setReplyTo(new javax.mail.Address[] {
				new javax.mail.internet.InternetAddress(modelShareMailContent.getReplyToAddress()) });

		StringBuilder sb = new StringBuilder("");
		sb.append("<div style=\"width: 100%; background-color: #404040;\">");
		sb.append(HEADER_LOGO_IMAGE);
		sb.append("</div><br/>");
		sb.append("Dear ").append(modelShareMailContent.getReceivingUser()).append(",<br/><br/>");
		sb.append("This email is to let you know that ").append(modelShareMailContent.getSharingUser())
				.append(" shared a Model (<span style=\"font-style: italic;\">")
				.append(modelShareMailContent.getModelName()).append("</span>) with you in ModelIt!.<br/><br/>");
		if (modelShareMailContent.getShareAccess() == SHARE_ACCESS.ADMIN
				|| modelShareMailContent.getShareAccess() == SHARE_ACCESS.EDIT) {
			sb.append("View, simulate, and edit");
		} else {
			sb.append("View and simulate");
		}
		sb.append(" the shared model in ModelIt! here: <a href=\"")
				.append(modelShareMailContent.getModelAccessLink()).append("\">");
		sb.append(modelShareMailContent.getModelName()).append("</a>");

		msg.setContent(sb.toString(), "text/html");
		Transport.send(msg);
	}

	public static void sendUserRegistrationNotification(final List<UserRegistrationNotification> userRegistrationNotifications,
			final List<Profile> profiles) throws Exception {
		StringBuilder content = new StringBuilder("<style>table, th, td { border: 1px solid black; }</style>");
		content.append("<table><tr>");
		content.append("<th>Domain</th>" +
						"<th>Email</th>" +
						"<th>First name</th>" +
						"<th>Last name</th></tr>");
		for (int i=0; i<profiles.size(); i++) {
			content.append(buildTableData(new ArrayList<>(Arrays.asList(
						userRegistrationNotifications.get(i).getDomain().name(),
					profiles.get(i).getEmail(),
					profiles.get(i).getFirstName(),
					profiles.get(i).getLastName()
			))));
		}
		content.append("</table>");

		sendMail(MailSettings.FROM_ADDRESS,
				new ArrayList<>(Arrays.asList(MailSettings.FROM_ADDRESS)),
				"CC: New Users Notification | " + profiles.size() + " new user(s)",
				content.toString());
	}
	private static String buildTableData(List<String> data) {
		StringBuilder res = new StringBuilder("<tr>");
		data.forEach((item) -> {
			res.append("<td>"+item+"</td>");
		});
		return res.append("</tr>").toString();
	}

	public static void sendAuthorityRequestNotification(final Profile profile,
			final Role role, final String userEmailSuffix, final String apiLinkApprove, final String apiLinkDeny, List<String> toAddresses )
			throws Exception {

		if (toAddresses == null) {
			String rawToAddresses = MailSettings.AUTHORITY_APPROVAL_ADDRESS;
			toAddresses = Arrays.stream(rawToAddresses.split("\\s*,\\s*")).collect(Collectors.toList());
		}

		StringBuilder sb = new StringBuilder("");
		sb.append("<div style=\"width: 100%; background-color: #404040;\">");
		sb.append(HEADER_LOGO_IMAGE);
		sb.append("</div><br/>");
		sb.append("<span style=\"font-weight: bold;\">E-Mail: </span>").append(profile.getEmail());
		sb.append("<br/>");
		sb.append("<span style=\"font-weight: bold;\">First Name: </span>").append(profile.getFirstName());
		sb.append("<br/>");
		sb.append("<span style=\"font-weight: bold;\">Last Name: </span>").append(profile.getLastName());
		sb.append("<br/>");
		sb.append("<span style=\"font-weight: bold;\">Institution: </span>").append(profile.getInstitution());
		sb.append("<br/><br/><br/>");
		sb.append("<div style=\"width: 100px; font-weight: bold; background-color: #3cb371\">");
		sb.append("<a href=\"" + apiLinkApprove + "\" style=\"text-decoration: none;\">").append("MANAGE REQUEST")
				.append("</a>");
		sb.append("</div>");

		final String uniqueKeyID = "IUr2WAEQ4Z"; //TODO
		StringBuilder logPost = new StringBuilder("{");
		logPost.append("\"keyID\": \"" + uniqueKeyID + "\",");
		logPost.append("\"approvals\": \"" + toAddresses.toString() + "\",");
		logPost.append("\"requester\": \"" + profile.getEmail() + "\",");
		logPost.append("\"linkapprove\": \"" + apiLinkApprove + "\",");
		logPost.append("\"linkdeny\": \"" + apiLinkApprove + "\"");
		logPost.append("}");
		
		final String httpPostURL = "http://"+System.getenv("CC_WEB_HOST")+":"+System.getenv("CC_WEB_PORT")+"/web/api/system/logger";
		CloseableHttpClient httpClient = HttpClients.createDefault();
		HttpPost httpPost = new HttpPost(httpPostURL);
		StringEntity requestEntity = new StringEntity(logPost.toString(), ContentType.APPLICATION_JSON);
		httpPost.setEntity(requestEntity);
		
		try {
			httpClient.execute(httpPost);
		} catch (IOException e) {
			throw new Exception("Logs were not registered when sending emails for approval. "+httpPostURL,	e);
		}

		sendMail(MailSettings.FROM_ADDRESS, 
			toAddresses,
			String.format("User Authority Request: %s %s", role.getName().name(), userEmailSuffix).trim(),
			sb.toString());
	}

	public static void sendAuthotityRequestRequested(final Profile profile, final String userEmailSuffix)
		throws Exception {

		StringBuilder sb = new StringBuilder(buildEmailHeader(profile));
		String name = getEmailName(profile);

		sb.append("Dear ").append(name).append(",").append("<br/>");

		sb.append("Thank you for your interest in ModelIt!. Your request for a Teacher Account will be reviewed by our team.");

		sb.append("<br/><br/>");
		sb.append("Don't hesitate to contact us with any questions.");
		sb.append("<br/><br/>");
		sb.append("ModelIt! Team");

		sendMail(MailSettings.FROM_ADDRESS, 
			new ArrayList<>(Arrays.asList(profile.getEmail())),
			("Teach Authorization Requested " + userEmailSuffix).trim(),
			sb.toString());
	}

	public static void sendAuthorityRequestApproved(final Profile profile, final String userEmailSuffix)
			throws Exception {
		StringBuilder sb = new StringBuilder(buildEmailHeader(profile));
		String name = getEmailName(profile);

		sb.append("Dear ").append(name).append(",").append("<br/>");
		sb.append(
				"Thank you again for your interest in ModelIt!. Your request for a Teacher Account has been <b>approved</b>.");
		sb.append("<br/><br/>");
		sb.append("Don't hesitate to contact us with any questions.");
		sb.append("<br/><br/>");
		sb.append("ModelIt! Team");

		sendMail(MailSettings.FROM_ADDRESS, 
			new ArrayList<>(Arrays.asList(profile.getEmail())),
			("Authorization Request Approved " + userEmailSuffix).trim(),
			sb.toString());
	}

	public static void sendAuthorityRequestDenied(final Profile profile, final String userEmailSuffix)
			throws Exception {
		StringBuilder sb = new StringBuilder(buildEmailHeader(profile));
		String name = getEmailName(profile);

		sb.append("Dear ").append(name).append(",").append("<br/>");
		sb.append(
				"Thank you again for your interest in ModelIt!. Your request for a Teacher Account has been <b>denied</b>.");
		sb.append("<br/><br/>");
		sb.append("Please contact us if you feel this is an error");
		sb.append("<br/><br/>");
		sb.append("ModelIt! Team");

		sendMail(MailSettings.FROM_ADDRESS, 
			new ArrayList<>(Arrays.asList(profile.getEmail())),
			("Authorization Request Denied " + userEmailSuffix).trim(),
			sb.toString());
	}

	public static void sendMail(String fromAdd, List<String> toAdd, 
			String subject, String content) throws Exception {
		Session session = Session.getDefaultInstance(MailSettings.getMailProperties(),
		MailSettings.getMailAuthenticator());

		// create a message
		Message msg = new MimeMessage(session);

		InternetAddress addressFrom = new InternetAddress(fromAdd);
		msg.setFrom(addressFrom);

		InternetAddress[] recipientAddresses = new InternetAddress[toAdd.size()];
		for (int i=0; i<toAdd.size(); i++) {
			recipientAddresses[i] = new InternetAddress(toAdd.get(i));
		}
		msg.setRecipients(RecipientType.TO, recipientAddresses);
		msg.setSubject(subject);
		msg.setContent(content, "text/html");
		Transport.send(msg);
	}

	public static String buildEmailHeader(Profile profile) {
		StringBuilder sb = new StringBuilder("");
		sb.append("<div style=\"width: 100%; background-color: #404040;\">");
		sb.append(HEADER_LOGO_IMAGE);
		sb.append("</div><br/>");
		return sb.toString();
	}

	public static String getEmailName(Profile profile) {
		String name = "<Please Complete User Profile>";
		if (profile.getFirstName() != null && profile.getLastName() != null) {
			name = profile.getFirstName() + " " + profile.getLastName();
		} else if (profile.getFirstName() != null) {
			name = profile.getFirstName();
		} else if (profile.getLastName() != null) {
			name = profile.getLastName();
		}
		return name;
	}
}