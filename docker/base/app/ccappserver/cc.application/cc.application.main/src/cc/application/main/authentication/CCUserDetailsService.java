/**
 * 
 */
package cc.application.main.authentication;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import cc.common.data.user.Role;
import cc.common.data.user.User;
import cc.dataaccess.user.dao.UserDao;

/**
 * @author Bryan Kowal
 */
public class CCUserDetailsService implements UserDetailsService {

	@Autowired
	private UserDao userDao;

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.springframework.security.core.userdetails.UserDetailsService#
	 * loadUserByUsername(java.lang.String)
	 */
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		/*
		 * Retrieve the user if the user exists.
		 */
		User user = this.userDao.getUserByEmail(username);
		if (user == null) {
			/*
			 * No user record has been found.
			 */
			throw new UsernameNotFoundException("Invalid username and/or password.");
		}

		List<CCAuthority> authorities = new ArrayList<>(user.getAuthorities().size());
		for (Role userRole : user.getAuthorities()) {
			authorities.add(new CCAuthority(userRole.getName()));
		}

		return new CCUser(user.getId(), username, user.getPassword(), authorities, user.isEnabled());
	}

	protected UserDao getUserDao() {
		return this.userDao;
	}
}