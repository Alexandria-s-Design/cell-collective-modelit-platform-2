/**
 * 
 */
package cc.application.main.authentication.token;

import java.io.IOException;
import java.util.UUID;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.web.filter.GenericFilterBean;

/**
 * @author Bryan Kowal
 *
 */
public class StatelessAuthenticationFilter extends GenericFilterBean {

	private final AnonymousAuthenticationFilter anonymousAuthenticationFilter = new AnonymousAuthenticationFilter(
			UUID.randomUUID().toString());

	private final TokenAuthenticationService tokenAuthenticationService;

	public StatelessAuthenticationFilter(TokenAuthenticationService tokenAuthenticationService) {
		this.tokenAuthenticationService = tokenAuthenticationService;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest,
	 * javax.servlet.ServletResponse, javax.servlet.FilterChain)
	 */
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		Authentication authentication = this.tokenAuthenticationService.getAuthentication((HttpServletRequest) request);
		if (authentication == null) {
			// HttpServletResponseWrapper res = new
			// HttpServletResponseWrapper((HttpServletResponse) response);
			// res.sendError(440);
			this.anonymousAuthenticationFilter.doFilter(request, response, chain);
		} else {
			SecurityContextHolder.getContext().setAuthentication(authentication);
			chain.doFilter(request, response);
		}
	}
}