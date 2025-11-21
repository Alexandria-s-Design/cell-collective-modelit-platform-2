/**
 * 
 */
package cc.application.main.controller;

import java.net.InetAddress;
import java.net.UnknownHostException;
import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import cc.application.main.IPAddressUtil;
import cc.application.main.thread.BackgroundThreadManager;
import cc.application.main.thread.ShutdownTask;

/**
 * @author Bryan Kowal
 */
@Controller
public class ShutdownController {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@RequestMapping(value = "/shutdown", method = RequestMethod.GET, produces = MediaType.TEXT_PLAIN_VALUE)
	public @ResponseBody ResponseEntity<Object> shutdown(ServletRequest req) {
		final String ip = IPAddressUtil.getIpAddr(((HttpServletRequest) req));

		InetAddress inetAddress;
		try {
			inetAddress = InetAddress.getByName(ip);
		} catch (UnknownHostException e) {
			logger.error("Failed to lookup/resolve IP Address: " + ip + ".", e);
			return new ResponseEntity<Object>("IP Address lookup failed.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
		if (inetAddress.isLoopbackAddress()) {
			logger.info("Received shutdown request. Application Server shutting down (~{}s delay) ...",
					(ShutdownTask.SHUTDOWN_DELAY_SECS + BackgroundThreadManager.SHUTDOWN_DELAY_SECS));
			ShutdownTask.schedule();
			return new ResponseEntity<Object>("Shutdown in progress.", HttpStatus.OK);
		}

		logger.warn("Ignoring shutdown request from host: '{}'.", ip);
		return new ResponseEntity<Object>("Forbidden.", HttpStatus.FORBIDDEN);
	}
}