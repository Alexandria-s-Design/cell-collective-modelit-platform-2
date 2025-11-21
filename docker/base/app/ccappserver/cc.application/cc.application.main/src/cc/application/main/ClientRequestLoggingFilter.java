/**
 * 
 */
package cc.application.main;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.GenericFilterBean;

import cc.application.main.authentication.CCUser;
import cc.application.main.http.MultiReadHttpServletRequest;

/**
 * @author Bryan Kowal
 *
 */
public class ClientRequestLoggingFilter extends GenericFilterBean {

	private static final String MODEL_SAVE_SERVICE = "/model/save";

	private final Logger jsonRequestLogger = LoggerFactory.getLogger("jsonRequestLogger");

	public ClientRequestLoggingFilter() {
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest,
	 * javax.servlet.ServletResponse, javax.servlet.FilterChain)
	 */
	@Override
	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;
		MultiReadHttpServletRequest multiReadRequest = null;
		if (request.getRequestURI() != null && MODEL_SAVE_SERVICE.equals(request.getRequestURI())
				&& request.getContentLength() > 0) {
			multiReadRequest = new MultiReadHttpServletRequest(request);
			jsonRequestLogger.info("Received json POST data: {} from user: {}, ip = {}.",
					multiReadRequest.getReader().readLine(), this.getAuthenticatedUserId(),
					IPAddressUtil.getIpAddr(request));
		}

		if (multiReadRequest == null) {
			chain.doFilter(req, res);
		} else {
			chain.doFilter(multiReadRequest, res);
		}
	}

	private Long getAuthenticatedUserId() {
		SecurityContext context = SecurityContextHolder.getContext();
		if (context == null) {
			return null;
		}

		if (context.getAuthentication() == null
				|| context.getAuthentication().getPrincipal() instanceof CCUser == false) {
			return null;
		}

		return ((CCUser) context.getAuthentication().getPrincipal()).getUserId();
	}
}