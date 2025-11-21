/**
 * 
 */
package cc.application.main.authentication.token;

import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import cc.application.main.CustomHeaders;
import cc.application.main.authentication.CCAuthentication;
import cc.application.main.authentication.CCUser;
import cc.common.data.TCCDomain;
import cc.common.data.TCCDomain.Domain;
import cc.common.data.user.Role.USER_ROLE;

/**
 * @author Bryan Kowal
 *
 */
public class TokenAuthenticationService {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	public static final String AUTH_HEADER_NAME = "Authorization"; //"X-AUTH-TOKEN";

	private final TokenHandler tokenHandler;

	public TokenAuthenticationService(final TokenHandler tokenHandler) {
		this.tokenHandler = tokenHandler;
	}

	public Authentication getAuthentication(HttpServletRequest request) {
		final String accessToken = request.getHeader(AUTH_HEADER_NAME);
		if (accessToken == null) {
			return null;
		}
		final UserDetails userDetails = this.tokenHandler.parseUserFromToken(accessToken);
		if (userDetails == null) {
			return null;
		}
		return new CCAuthentication(userDetails, accessToken);
	}
	
	public CCUser getUserForToken(final String token)
	{
		final UserDetails userDetails = this.tokenHandler.parseUserFromToken(token);
		if (userDetails == null) {
			return null;
		}
		if (userDetails instanceof CCUser)
		{
			return (CCUser) userDetails;
		}
		return null;
	}

	protected Domain getOrigin(ServletRequest req, final Long userId) {
		HttpServletRequest request = (HttpServletRequest) req;
		String origin = request.getHeader("origin");
		Domain domain = TCCDomain.determineDomain(origin);
		if (domain == null) {
			/* Check for overrides */
			final String domainOverride = request.getHeader(CustomHeaders.OVERRIDE_DOMAIN);
			if (domainOverride == null) {
				return null;
			}
			domain = TCCDomain.determineDomainFromOverride(domainOverride);
			if (domain != null) {
				logger.info("Domain Override for Domain: {} has been initiated for User: {}.", domain.name(), userId);
			}
		}

		return domain;
	}
}