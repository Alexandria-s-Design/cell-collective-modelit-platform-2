/**
 * 
 */
package cc.application.simulation;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cc.common.data.biologic.Species;
import cc.common.data.builder.BooleanExpressionBuilder;
import cc.common.data.builder.IExpressionCustomizer;
import cc.common.data.model.Model;

/**
 * @author Bryan
 *
 */
public abstract class AbstractSimulationManager {

	protected static final String X_VAR_PREFIX = "[varX_";

	protected static final String X_VAR_SUFFIX = "]";

	protected final ExecutorService simulationExecutorService;

	protected final int maxSimulations;

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	/**
	 * 
	 */
	public AbstractSimulationManager(final int maxSimulationsCount) {
		this.simulationExecutorService = Executors.newFixedThreadPool(maxSimulationsCount);
		this.maxSimulations = maxSimulationsCount;
		logger.info("Max simulations allowed = " + this.maxSimulations + " ...");
	}

	protected Map<Long, String> buildJSVariableMap(final Model model) {
		final Map<Long, String> jsVariableMap = new HashMap<>(model.getSpecies().size(), 1.0f);
		int index = 0;
		for (Species species : model.getSpecies()) {
			++index;
			final String speciesAlias = X_VAR_PREFIX + Integer.toString(index) + X_VAR_SUFFIX;
			jsVariableMap.put(species.getId(), speciesAlias);
		}

		return jsVariableMap;
	}

	protected Map<Long, JSExpression> constructJSExpressionMap(final Map<Long, String> jsVariableMap,
			final Model model) {
		IExpressionCustomizer expressionCustomizer = new JSExpressionCustomizer(jsVariableMap);
		final Map<Long, JSExpression> speciesExpressionMap = new HashMap<>(model.getSpecies().size(), 1.0f);
		for (Species species : model.getSpecies()) {
			if (species.isExternal()) {
				speciesExpressionMap.put(species.getId(), null);
				continue;
			}

			final Set<String> inputSpecies = new HashSet<>();
			final Set<Long> inputSpeciesIds = new HashSet<>();
			final String jsBooleanExpression = BooleanExpressionBuilder.buildBooleanExpression(species,
					expressionCustomizer, inputSpecies, inputSpeciesIds);
			if (jsBooleanExpression == null) {
				speciesExpressionMap.put(species.getId(), null);
			} else {
				speciesExpressionMap.put(species.getId(),
						new JSExpression(jsBooleanExpression, inputSpecies, inputSpeciesIds));
			}
		}

		return speciesExpressionMap;
	}
}