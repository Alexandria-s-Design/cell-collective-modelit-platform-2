/**
 * 
 */
package cc.application.simulation;

import java.util.Set;

/**
 * @author Bryan
 *
 */
public class JSExpression {

	private final String booleanExpression;

	private final Set<String> booleanInputs;

	private final Set<Long> booleanInputIds;

	/**
	 * 
	 */
	public JSExpression(final String booleanExpression, final Set<String> booleanInputs,
			final Set<Long> booleanInputIds) {
		this.booleanExpression = booleanExpression;
		this.booleanInputs = booleanInputs;
		this.booleanInputIds = booleanInputIds;
	}

	/**
	 * @return the booleanExpression
	 */
	public String getBooleanExpression() {
		return booleanExpression;
	}

	/**
	 * @return the booleanInputs
	 */
	public Set<String> getBooleanInputs() {
		return booleanInputs;
	}

	public Set<Long> getBooleanInputIds() {
		return booleanInputIds;
	}
}