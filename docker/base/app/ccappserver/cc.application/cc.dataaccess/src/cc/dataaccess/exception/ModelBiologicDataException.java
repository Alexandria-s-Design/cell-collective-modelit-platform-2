/**
 * 
 */
package cc.dataaccess.exception;

import org.springframework.dao.DataAccessException;

/**
 * @author Bryan Kowal
 *
 */
public class ModelBiologicDataException extends DataAccessException {

	/**
	 * 
	 */
	private static final long serialVersionUID = -8118363815448985439L;

	/**
	 * @param msg
	 */
	public ModelBiologicDataException(String msg) {
		super(msg);
	}

	/**
	 * @param msg
	 * @param cause
	 */
	public ModelBiologicDataException(String msg, Throwable cause) {
		super(msg, cause);
	}
}