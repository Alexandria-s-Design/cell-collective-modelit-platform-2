/**
 * 
 */
package cc.application.main.authentication;

import java.io.IOException;
import java.util.Calendar;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import cc.common.data.user.Activity;
import cc.common.data.user.User;
import cc.dataaccess.user.dao.UserDao;

/**
 * @author Bryan Kowal
 *
 */
public class CCAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	private final UserDao userDao;

	public CCAuthenticationSuccessHandler(UserDao userDao) {
		this.userDao = userDao;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.springframework.security.web.authentication.
	 * AuthenticationSuccessHandler#onAuthenticationSuccess(javax.servlet.http.
	 * HttpServletRequest, javax.servlet.http.HttpServletResponse,
	 * org.springframework.security.core.Authentication)
	 */
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		CCUser user = null;
		if (authentication.getPrincipal() instanceof CCUser) {
			user = (CCUser) authentication.getPrincipal();
		} else {
			String principalClass = (authentication.getPrincipal() == null) ? "null"
					: authentication.getPrincipal().getClass().getName();
			logger.warn("Unrecognized Principal received: " + principalClass + ".");
			return;
		}

		User authenticatedUser = this.userDao.getUserByEmail(user.getUsername());
		if (authenticatedUser == null) {
			logger.warn("No User Account was found for e-mail: " + user.getUsername() + ".");
			return;
		}

		Activity activity = new Activity();
		activity.setLoginDate(Calendar.getInstance());
		activity.setUser(authenticatedUser);
		this.userDao.saveUserActivity(activity);
	}
}