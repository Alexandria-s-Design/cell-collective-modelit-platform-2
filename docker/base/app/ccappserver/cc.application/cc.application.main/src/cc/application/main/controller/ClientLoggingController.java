/**
 * 
 */
package cc.application.main.controller;

import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import cc.application.main.IPAddressUtil;
import cc.common.data.user.AnonymousUser;
import cc.dataaccess.user.dao.AnonymousUserDao;

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/client")
public class ClientLoggingController extends AbstractController {

	private static final String REQUEST_USER_AGENT = "user-agent";

	private static final String ANONYMOUS_FMT = "A%d";

	@Autowired
	private AnonymousUserDao anonymousUserDao;

	@RequestMapping(value = "/log", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_PLAIN_VALUE)
	public @ResponseBody ResponseEntity<Object> log(@RequestBody String data, ServletRequest req) {
		if (data == null || data.trim().isEmpty()) {
			return new ResponseEntity<Object>("No Data to Log!", HttpStatus.NO_CONTENT);
		}

		final HttpServletRequest httpServletRequest = (HttpServletRequest) req;

		final String ip = IPAddressUtil.getIpAddr(httpServletRequest);
		final String userAgent = httpServletRequest.getHeader(REQUEST_USER_AGENT);
		final String userId = getUserForLogging(ip, userAgent);

		logger.info("User = {}, ip = {}; data = {} ", userId, ip, data.trim());

		return new ResponseEntity<Object>("Data Successfully Logged.", HttpStatus.OK);
	}

	private String getUserForLogging(final String ip, final String userAgent) {
		final Long userId = this.getAuthenticatedUserId();
		if (userId != null) {
			return Long.toString(userId.longValue());
		}

		AnonymousUser anonymousUser = anonymousUserDao.getAnonymousUser(ip, userAgent);
		if (anonymousUser == null) {
			/*
			 * Attempt to create a {@link AnonymousUser}.
			 */
			anonymousUser = new AnonymousUser();
			anonymousUser.setIp(ip);
			anonymousUser.setUserAgent(userAgent);
			anonymousUser = anonymousUserDao.save(anonymousUser);
		}
		if (anonymousUser == null) {
			/*
			 * If still {@code null}, an {@link AnonymousUser} could not be
			 * created.
			 */
			return null;
		}

		return String.format(ANONYMOUS_FMT, anonymousUser.getId());
	}
}