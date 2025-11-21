/**
 * 
 */
package cc.application.jsbml;

import java.util.Map;

import cc.application.jsbml.response.bool.BooleanAnalysisOperators;
import cc.common.data.builder.IExpressionCustomizer;

/**
 * @author Bryan Kowal
 *
 */
public class SBMLValidationExpressionCustomizer implements IExpressionCustomizer {

	private final Map<Long, String> sbmlVariableMap;

	public SBMLValidationExpressionCustomizer(final Map<Long, String> sbmlVariableMap) {
		this.sbmlVariableMap = sbmlVariableMap;
	}

	@Override
	public String getAndOperator() {
		return BooleanAnalysisOperators.AND_OP;
	}

	@Override
	public String getOrOperator() {
		return BooleanAnalysisOperators.OR_OP;
	}

	@Override
	public String getNotOperator() {
		return BooleanAnalysisOperators.NOT_OP;
	}

	@Override
	public String getVariable(Long speciesId, String species, boolean active) {
		return sbmlVariableMap.get(speciesId);
	}
}