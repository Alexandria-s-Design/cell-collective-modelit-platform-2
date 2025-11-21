/**
 * 
 */
package cc.common.data.builder;

/**
 * @author Bryan
 *
 */
public class DefaultExpressionCustomizer implements IExpressionCustomizer {

	private static final String DEFAULT_AND = "AND";

	private static final String DEFAULT_OR = "OR";

	private static final String DEFAULT_NOT = "NOT";

	/**
	 * 
	 */
	public DefaultExpressionCustomizer() {
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.common.data.builder.IExpressionCustomizer#getAndOperator()
	 */
	@Override
	public String getAndOperator() {
		return DEFAULT_AND;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.common.data.builder.IExpressionCustomizer#getOrOperator()
	 */
	@Override
	public String getOrOperator() {
		return DEFAULT_OR;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.common.data.builder.IExpressionCustomizer#getNotOperator()
	 */
	@Override
	public String getNotOperator() {
		return DEFAULT_NOT;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.common.data.builder.IExpressionCustomizer#getVariable(java.lang.
	 * String)
	 */
	@Override
	public String getVariable(Long speciesId, String species, final boolean active) {
		return species;
	}
}