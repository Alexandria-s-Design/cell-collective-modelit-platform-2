/**
 * 
 */
package cc.dataaccess;

/**
 * @author Bryan Kowal
 *
 */
public abstract class AbstractJSIdentifiable {

	protected static final String STRING_PLACEHOLDER = "%s";

	protected static final String DELIMITER = "->";

	protected static final String JS_IDENTIFIER_FORMAT = STRING_PLACEHOLDER
			+ DELIMITER + STRING_PLACEHOLDER;

	public abstract String toJSIdentifier();
}