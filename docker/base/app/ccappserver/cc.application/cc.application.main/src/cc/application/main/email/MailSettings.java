/**
 * 
 */
package cc.application.main.email;

import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;

import cc.application.main.WebServiceUtil;

/**
 * @author Bryan Kowal
 *
 */
public final class MailSettings {

	public static final String FROM_ADDRESS = WebServiceUtil.getenv("FROM_ADDRESS", "support@cellcollective.org");

	public static final String AUTHORITY_APPROVAL_ADDRESS = WebServiceUtil.getenv("AUTHORITY_APPROVAL_ADDRESS", "thelikar2@unl.edu");

	private static final String STMP_SSL_ENABLE = "mail.smtp.ssl.enable";

	private static final String SMTP_HOST_PROPERTY = "mail.smtp.host";

	private static final String SMTP_PORT_PROPERTY = "mail.smtp.port";

	private static final String SMTP_AUTH_PROPERTY = "mail.smtp.auth";

	private static final String SMTP_CONNECT_TIMEOUT_PROPERTY = "mail.smtp.connectiontimeout";

	private static final String SMTP_TIMEOUT_PROPERTY = "mail.smtp.timeout";

	private static final String SMTP_DEBUG_PROPERTY = "mail.debug";

		private static final String SMTP_TLS_ENABLE = "mail.smtp.starttls.enable";

	private static final String SMTP_HOST = WebServiceUtil.getenv("SMTP_HOST", "smtpout.secureserver.net");

	private static final String SMTP_PORT = WebServiceUtil.getenv("SMTP_PORT", "80");

	private static final String SMTP_AUTH = WebServiceUtil.getenv("SMTP_AUTH", "true");

	private static final String SMTP_AUTH_USER = WebServiceUtil.getenv("SMTP_AUTH_USER", "support@cellcollective.org");

	private static final String SMTP_AUTH_PASSWORD = WebServiceUtil.getenv("SMTP_AUTH_PASSWORD", "mathbio1@");

	private static final String SMTP_DEBUG = WebServiceUtil.getenv("SMTP_DEBUG", "false");

	private static final String SMTP_SSL = WebServiceUtil.getenv("SMTP_SSL", "false");

	private static final String SMTP_TLS = WebServiceUtil.getenv("SMTP_TLS", "true");

	private static final int TIMEOUT = Integer.parseInt(WebServiceUtil.getenv("SMTP_TIMEOUT", "2000"));


	protected MailSettings() {
	}

	public static Properties getMailProperties() {
		Properties properties = new Properties();
		properties.put(SMTP_HOST_PROPERTY, SMTP_HOST);
		properties.put(SMTP_PORT_PROPERTY, SMTP_PORT);
		properties.put(SMTP_AUTH_PROPERTY, SMTP_AUTH);
		properties.put(SMTP_CONNECT_TIMEOUT_PROPERTY, TIMEOUT);
		properties.put(SMTP_TIMEOUT_PROPERTY, TIMEOUT);
		properties.put(SMTP_DEBUG_PROPERTY, SMTP_DEBUG);
		properties.put(STMP_SSL_ENABLE, SMTP_SSL);
		properties.put(SMTP_TLS_ENABLE, SMTP_TLS);
		
		return properties;
	}

	public static Authenticator getMailAuthenticator() {
		return new SMTPAuthenticator();
	}

	private static class SMTPAuthenticator extends javax.mail.Authenticator {
		public PasswordAuthentication getPasswordAuthentication() {
			String username = SMTP_AUTH_USER;
			String password = SMTP_AUTH_PASSWORD;
			return new PasswordAuthentication(username, password);
		}
	}
}
