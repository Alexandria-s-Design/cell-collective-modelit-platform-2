/**
 * 
 */
package cc.application.main.response;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * @author Bryan
 *
 */
@ResponseStatus(value = HttpStatus.FORBIDDEN,
		reason = "Access Denied! Please login to the ModelIt!.")
public class UserNotAuthenticatedException extends RuntimeException {

	private static final long serialVersionUID = 275372885492663627L;

	/**
	 * 
	 */
	public UserNotAuthenticatedException() {
	}
}