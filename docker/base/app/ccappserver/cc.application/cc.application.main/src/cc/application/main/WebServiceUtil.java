package cc.application.main;

/**
 * @author Achilles Rasquinha
 */
public final class WebServiceUtil {
	private static final String ENVIRONMENT_VARIABLE_PREFIX 	= "CC";
	private static final String ENVIRONMENT_VARIABLE_SEPERATOR 	= "_";

	public static String getenvvar(String variable, String prefix, String seperator) {
		String envvar 	= String.format("%s%s%s", prefix, seperator, variable);
		return envvar;
	}

	public static String getenv(String variable, String defaultValue) {
		String envvar 	= WebServiceUtil.getenvvar(variable,
			WebServiceUtil.ENVIRONMENT_VARIABLE_PREFIX,
			WebServiceUtil.ENVIRONMENT_VARIABLE_SEPERATOR
		);
		
		String value	= System.getenv(envvar);
		if ( value == null ) {
			value = defaultValue;
		}

		return value;
	}

	public static String getWebServiceURL() {
		String host 	= WebServiceUtil.getenv("WEB_HOST", "localhost");
		String port 	= WebServiceUtil.getenv("WEB_PORT", "5000");

		String protocol	= WebServiceUtil.getenv("WEB_PROTOCOL", "http");

		String url		= String.format("%s://%s:%s", protocol, host, port);

		return url;
	}
}