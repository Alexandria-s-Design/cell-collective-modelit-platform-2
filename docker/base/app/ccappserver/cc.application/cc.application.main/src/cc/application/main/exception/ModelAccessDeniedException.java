/**
 * 
 */
package cc.application.main.exception;

/**
 * @author Bryan Kowal
 *
 */
public class ModelAccessDeniedException extends Exception {

	private static final long serialVersionUID = 9194678904530274430L;

	public static final String ACTION_VIEW = "view";

	public static final String ACTION_EDIT_PUBISH = "edit or publish";

	public static final String ACTION_SIMULATE = "simulate";

	public static final String ACTION_RATE = "rate";
	
	public static final String ACTION_SHARE = "share";

	public ModelAccessDeniedException(final String action, final Number modelId) {
		super(new StringBuilder("User does not have required permission to " + action + " model: ")
				.append(modelId.longValue()).append("!").toString());
	}
}