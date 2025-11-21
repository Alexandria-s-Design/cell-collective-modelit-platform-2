/**
 * 
 */
package cc.application.main.controller;

import cc.application.jsbml.response.bool.BooleanAnalysisOperators;
import cc.common.data.builder.DefaultExpressionCustomizer;

/**
 * @author Bryan Kowal
 */
public class SBMLImportVerificationExpressionCustomizer extends DefaultExpressionCustomizer {

	@Override
	public String getAndOperator() {
		return BooleanAnalysisOperators.AND_OP.trim();
	}
	
	@Override
	public String getOrOperator() {
		return BooleanAnalysisOperators.OR_OP.trim();
	}
	
	@Override
	public String getNotOperator() {
		return BooleanAnalysisOperators.NOT_OP.trim();
	}
}