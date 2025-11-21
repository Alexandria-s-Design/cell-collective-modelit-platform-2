/**
 * 
 */
package cc.application.jsbml;

import java.util.Map;

import cc.common.data.builder.DefaultExpressionCustomizer;

/**
 * @author Bryan Kowal
 */
public class SBMLExpressionCustomizer extends DefaultExpressionCustomizer {

	private static final String SBML_ACTIVE_PATTERN = "%s == 1";

	private static final String SBML_INACTIVE_PATTERN = "%s == 0";

	private final Map<Long, String> sbmlVariableMap;

	public SBMLExpressionCustomizer(Map<Long, String> sbmlVariableMap) {
		this.sbmlVariableMap = sbmlVariableMap;
	}

	@Override
	public String getVariable(Long speciesId, String species, final boolean active) {
		final String varName = this.sbmlVariableMap.get(speciesId);
		return (active) ? String.format(SBML_ACTIVE_PATTERN, varName) : String.format(SBML_INACTIVE_PATTERN, varName);
	}
}