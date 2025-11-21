/**
 * 
 */
package cc.application.main.authentication;

import org.springframework.security.core.GrantedAuthority;

import cc.common.data.user.Role.USER_ROLE;

/**
 * @author Bryan Kowal
 */
public class CCAuthority implements GrantedAuthority {

	/**
	 * 
	 */
	private static final long serialVersionUID = -6841672088124314162L;

	private final USER_ROLE name;

	/**
	 * 
	 */
	public CCAuthority(USER_ROLE name) {
		this.name = name;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.springframework.security.core.GrantedAuthority#getAuthority()
	 */
	@Override
	public String getAuthority() {
		return this.name.name();
	}
}