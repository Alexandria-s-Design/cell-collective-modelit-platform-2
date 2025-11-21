/**
 * 
 */
package cc.application.jsbml;

/**
 * @author Bryan Kowal
 *
 */
public class SBMLValidationException extends Exception {

	private static final long serialVersionUID = -4296797985323487771L;

	public SBMLValidationException(String arg0) {
		super(arg0);
	}

	public SBMLValidationException(String arg0, Throwable arg1) {
		super(arg0, arg1);
	}
}