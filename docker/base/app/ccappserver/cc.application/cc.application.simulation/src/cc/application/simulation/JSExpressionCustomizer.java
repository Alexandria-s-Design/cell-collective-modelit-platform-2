/**
 * 
 */
package cc.application.simulation;

import java.util.Map;

import cc.common.data.builder.IExpressionCustomizer;

/**
 * @author Bryan
 *
 */
public class JSExpressionCustomizer implements IExpressionCustomizer {

	private static final String JS_AND = "&&";

	private static final String JS_OR = "||";

	private static final String JS_NOT = "!";

	private final Map<Long, String> jsVariableMap;

	/**
	 * 
	 */
	public JSExpressionCustomizer(Map<Long, String> jsVariableMap) {
		this.jsVariableMap = jsVariableMap;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.common.data.builder.IExpressionCustomizer#getAndOperator()
	 */
	@Override
	public String getAndOperator() {
		return JS_AND;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.common.data.builder.IExpressionCustomizer#getOrOperator()
	 */
	@Override
	public String getOrOperator() {
		return JS_OR;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.common.data.builder.IExpressionCustomizer#getNotOperator()
	 */
	@Override
	public String getNotOperator() {
		return JS_NOT;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.common.data.builder.IExpressionCustomizer#getVariable(java.lang.
	 * String)
	 */
	@Override
	public String getVariable(Long speciesId, String species, final boolean active) {
		return this.jsVariableMap.get(speciesId);
	}
}