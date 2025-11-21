/**
 * 
 */
package cc.application.main.authentication.token;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.session.SessionAuthenticationException;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;

import cc.application.main.authentication.CCUser;

/**
 * @author Bryan Kowal
 *
 */
public class CCJSONTokenSessionStrategy implements SessionAuthenticationStrategy {

	private final TokenHandler tokenHandler;

	/**
	 * 
	 */
	public CCJSONTokenSessionStrategy(TokenHandler tokenHandler) {
		this.tokenHandler = tokenHandler;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.springframework.security.web.authentication.session.
	 * SessionAuthenticationStrategy#onAuthentication(org.springframework.
	 * security.core.Authentication, javax.servlet.http.HttpServletRequest,
	 * javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void onAuthentication(Authentication authentication, HttpServletRequest request,
			HttpServletResponse response) throws SessionAuthenticationException {
		// if (authentication.getPrincipal() instanceof CCUser) {
		// 	response.addHeader(TokenAuthenticationService.AUTH_HEADER_NAME,
		// 			tokenHandler.createTokenForUser((CCUser) authentication.getPrincipal()));
		// }
	}
}