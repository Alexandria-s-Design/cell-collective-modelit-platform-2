/**
 * 
 */
package cc.application.main.authentication;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

/**
 * @author Bryan Kowal
 *
 */
public class DefaultAuthenticationManager implements AuthenticationManager {

	public DefaultAuthenticationManager() {
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.springframework.security.authentication.AuthenticationManager#
	 * authenticate(org.springframework.security.core.Authentication)
	 */
	@Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		return null;
	}
}