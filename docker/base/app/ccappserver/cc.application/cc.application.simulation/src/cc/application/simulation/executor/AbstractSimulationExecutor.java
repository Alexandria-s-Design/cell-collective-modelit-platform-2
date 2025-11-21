/**
 * 
 */
package cc.application.simulation.executor;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import org.slf4j.LoggerFactory;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.FileAppender;

import cc.application.simulation.JSExpression;
import cc.application.simulation.species.AbstractSimulationSpecies;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.simulation.SpeciesMutation;
import cc.common.simulate.settings.IInitialSimulationSettings;

/**
 * @author Bryan
 *
 */
public abstract class AbstractSimulationExecutor<S extends AbstractSimulationSpecies, E extends IInitialSimulationSettings> {

	protected final org.slf4j.Logger logger = LoggerFactory.getLogger(getClass());

	protected static final String JS_SEMICOLON = ";";

	protected static final String JS_RESULT_VAR = " var result = ";

	protected final ScriptEngine jsEngine;

	private Map<Long, String> jsVariableMap;

	protected Map<Long, JSExpression> speciesExpressionMap;

	protected final Map<Long, String> speciesIdToNameMap;

	protected final List<Long> initialActiveSpecies;

	protected final Map<Long, S> simulationSpecies = new HashMap<>();

	protected Logger simulationLogger;

	private final Map<String, Boolean> resultTruthTable = new HashMap<>();

	protected volatile boolean cancelled = false;

	public AbstractSimulationExecutor(final Map<Long, String> jsVariableMap,
			final Map<Long, JSExpression> speciesExpressionMap, E settings,
			final Map<Long, String> speciesIdToNameMap) {
		this.jsVariableMap = jsVariableMap;
		this.speciesExpressionMap = speciesExpressionMap;
		this.speciesIdToNameMap = speciesIdToNameMap;
		ScriptEngineManager engineManager = new ScriptEngineManager();
		jsEngine = engineManager.getEngineByName("nashorn");

		if (settings.getInitialState() == null || settings.getInitialState().getSpecies() == null
				|| settings.getInitialState().getSpecies().isEmpty()) {
			this.initialActiveSpecies = Collections.emptyList();
		} else {
			this.initialActiveSpecies = new ArrayList<>(settings.getInitialState().getSpecies().size());
			for (SpeciesIdentifier species : settings.getInitialState().getSpecies()) {
				this.initialActiveSpecies.add(species.getId());
			}
		}

		for (Long speciesId : speciesExpressionMap.keySet()) {
			S simulationSpecies = this.buildSimulationSpecies(speciesId, settings);
			this.simulationSpecies.put(speciesId, simulationSpecies);
		}
	}

	protected abstract S buildSimulationSpecies(final Long speciesId, E settings);

	protected boolean evaluateSpecies(S simulationSpecies, int timeStep) throws Exception {
		if (simulationSpecies.isCurrent(timeStep)) {
			return simulationSpecies.getPreviousState();
		}

		if (simulationSpecies.isExternalSpecies()) {
			boolean state = this.determineState(simulationSpecies);
			simulationSpecies.setCurrentState(state, timeStep);
			return simulationSpecies.getPreviousState();
		}

		if (simulationSpecies.getMutation() == SpeciesMutation.ON) {
			simulationSpecies.setCurrentState(true, timeStep);
			return simulationSpecies.getPreviousState();
		} else if (simulationSpecies.getMutation() == SpeciesMutation.OFF) {
			simulationSpecies.setCurrentState(false, timeStep);
			return simulationSpecies.getPreviousState();
		}

		/*
		 * We need to use the JS engine.
		 */
		String jsCommand = this.substituteInputs(simulationSpecies, timeStep);
		if (this.resultTruthTable.containsKey(jsCommand)) {
			boolean state = this.resultTruthTable.get(jsCommand);
			simulationSpecies.setCurrentState(state, timeStep);

			return simulationSpecies.getPreviousState();
		}

		jsEngine.eval(jsCommand);
		Object result = jsEngine.get("result");

		boolean state = (Boolean) result;
		this.resultTruthTable.put(jsCommand, state);
		simulationSpecies.setCurrentState(state, timeStep);

		return simulationSpecies.getPreviousState();
	}

	protected String substituteInputs(S simulationSpecies, int timeStep) throws Exception {
		String expression = simulationSpecies.getExpression();

		for (Long inputSpeciesId : simulationSpecies.getInputSpeciesIds()) {
			final boolean state = this.evaluateSpecies(this.simulationSpecies.get(inputSpeciesId), timeStep);
			final String jsVarName = this.jsVariableMap.get(inputSpeciesId);

			expression = expression.replaceAll(Pattern.quote(jsVarName), Boolean.toString(state));
		}

		StringBuilder sb = new StringBuilder(JS_RESULT_VAR);
		sb.append(expression);
		sb.append(JS_SEMICOLON);

		return sb.toString();
	}

	protected abstract boolean determineState(S simulationSpecies);

	public void stop() {
		this.cancelled = true;
	}

	protected void createSimulationLogger() {
		LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();
		PatternLayoutEncoder ple = new PatternLayoutEncoder();

		ple.setPattern("%date %level [%thread] %logger{10} [%file:%line] %msg%n");
		ple.setContext(lc);
		ple.start();

		final Path logPath = Paths.get("");
		FileAppender<ILoggingEvent> fileAppender = new FileAppender<ILoggingEvent>();
		fileAppender.setFile(logPath.toString());
		fileAppender.setEncoder(ple);
		fileAppender.setContext(lc);
		fileAppender.start();

		simulationLogger = (Logger) LoggerFactory.getLogger("simulation-X");
		simulationLogger.addAppender(fileAppender);
		simulationLogger.setLevel(Level.INFO);
		simulationLogger.setAdditive(false);
	}
}