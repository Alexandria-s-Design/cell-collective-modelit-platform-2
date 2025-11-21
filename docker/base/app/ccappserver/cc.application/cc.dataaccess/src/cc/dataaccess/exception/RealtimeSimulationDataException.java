/**
 * 
 */
package cc.dataaccess.exception;

import org.springframework.dao.DataAccessException;

/**
 * @author Bryan
 *
 */
public class RealtimeSimulationDataException extends DataAccessException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 7670583725087555198L;

	/**
	 * @param msg
	 */
	public RealtimeSimulationDataException(String msg) {
		super(msg);
	}

	/**
	 * @param msg
	 * @param cause
	 */
	public RealtimeSimulationDataException(String msg, Throwable cause) {
		super(msg, cause);
	}
}