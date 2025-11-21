/**
 * 
 */
package cc.application.main.authentication;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

/**
 * @author Bryan Kowal
 *
 */
public class CCUser extends User {

	private static final long serialVersionUID = -6263353005423388109L;

	private static final boolean accountNonExpired = true;

	private static final boolean credentialsNonExpired = true;

	private static final boolean accountNonLocked = true;

	private final long userId;

	public CCUser(long userId, String username, String password, Collection<? extends GrantedAuthority> authorities,
			boolean enabled) {
		super(username, password, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
		this.userId = userId;
	}

	public long getUserId() {
		return userId;
	}
}