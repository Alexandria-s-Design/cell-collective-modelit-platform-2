/**
 * 
 */
package cc.application.main.configuration;

import cc.application.main.WebServiceUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import cc.common.data.TCCDomain.Domain;

/**
 * @author Bryan Kowal
 */
@Component
@ConfigurationProperties(prefix = "domain")
public class DomainProperties {

	private static final String LINK_FMT = "://%s/#%d";

	private static final String HTTPS_LINK_FMT = "https" + LINK_FMT;

	private static final String HTTP_LINK_FMT = "http" + LINK_FMT;

	@Autowired
	private ServerProperties serverProperties;

	private String research;

	private String teach;

	private String api;

	private String userEmailSuffix;

	private String stripeAPIKey;

	public DomainProperties() {
		this.teach = WebServiceUtil.getenv("DOMAIN_TEACH", "teach.cellcollective.org");
		this.research = WebServiceUtil.getenv("DOMAIN_RESEARCH", "research.cellcollective.org");
		this.api = WebServiceUtil.getenv("DOMAIN_API", "cellcollective.org/web/_api/");
	}

	public String getResearch() {
		return research;
	}

	public void setResearch(String research) {
		this.research = research;
	}

	public String getTeach() {
		return teach;
	}

	public void setTeach(String teach) {
		this.teach = teach;
	}

	public String getApi() {
		return api;
	}

	public void setApi(String api) {
		this.api = api;
	}

	public String getUserEmailSuffix() {
		if (userEmailSuffix == null) {
			return StringUtils.EMPTY;
		}
		return userEmailSuffix;
	}

	public void setUserEmailSuffix(String userEmailSuffix) {
		this.userEmailSuffix = userEmailSuffix;
	}

	public String getStripeAPIKey() {
		return stripeAPIKey;
	}

	public void setStripeAPIKey(String stripeAPIKey) {
		this.stripeAPIKey = stripeAPIKey;
	}

	public String getModelLink(final Domain domain, final long modelId) {
		final String url = (domain != null && domain == Domain.TEACH) ? teach : research;
		final String format = (sslAvailable()) ? HTTPS_LINK_FMT : HTTP_LINK_FMT;

		return String.format(format, url, modelId);
	}

	public String getApiMethodLink(final String apiMethod) {
		if (sslAvailable()) {
			return "https://" + api + "/" + apiMethod;
		} else {
			return "http://" + api + "/" + apiMethod;
		}
	}

	public String getAdminMethodLink(final String apiMethod) {
		if (sslAvailable()) {
			return "https://" + research + "/" + apiMethod;
		} else {
			return "http://" + research + "/" + apiMethod;
		}
	}	

	private boolean sslAvailable() {
		if (this.serverProperties == null || this.serverProperties.getSsl() == null) {
			return false;
		}

		return serverProperties.getSsl().isEnabled();
	}
}