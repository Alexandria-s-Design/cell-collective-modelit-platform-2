/**
 * 
 */
package cc.application.simulation.executor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import cc.application.simulation.JSExpression;
import cc.application.simulation.RandomUtil;
import cc.application.simulation.species.DynamicSimulationSpecies;
import cc.common.data.simulation.CalcInterval;
import cc.common.data.simulation.SimulationState;
import cc.common.data.simulation.SpeciesMutation;
import cc.common.simulate.settings.dynamic.ActivityLevelRange;
import cc.common.simulate.settings.dynamic.DynamicSimulationSettings;
import cc.dataaccess.main.dao.ExperimentDataDao;

/**
 * @author Bryan
 */
public class DynamicSimulationExecutor
		extends AbstractSimulationExecutor<DynamicSimulationSpecies, DynamicSimulationSettings> implements Runnable {

	private static final String BITS_FILE_PATTERN = "bits%s.csv";

	private static final String COMMA = ", ";

	private final long experimentId;

	private final int totalTimeSteps;

	private final int runTime;

	private final Collection<CalcInterval> calcIntervals;

	private final int simulations;

	private final IDynamicSimulationProgressListener listener;

	private Double progress = 0.0;

	private long startTime;

	private ExperimentDataDao experimentDataDao;

	private Path experimentBitsPath;

	public DynamicSimulationExecutor(long experimentId, Map<Long, String> jsVariableMap,
			Map<Long, JSExpression> speciesExpressionMap, DynamicSimulationSettings settings,
			final Collection<CalcInterval> calcIntervals, final int runTime,
			IDynamicSimulationProgressListener listener, final Map<Long, String> speciesIdToNameMap) {
		super(jsVariableMap, speciesExpressionMap, settings, speciesIdToNameMap);
		this.experimentId = experimentId;
		this.runTime = runTime;
		this.calcIntervals = calcIntervals;
		this.simulations = settings.getSimulations();
		this.totalTimeSteps = this.runTime * this.simulations;
		this.listener = listener;
	}

	@Override
	public void run() {
		this.startTime = System.currentTimeMillis();
		this.listener.stateUpdate(this.experimentId, SimulationState.RUNNING);

		List<String> headerSpeciesList = new LinkedList<>(this.speciesIdToNameMap.values());
		Collections.sort(headerSpeciesList);

		StringBuilder sb = new StringBuilder();
		boolean first = true;
		for (String headerSpecies : headerSpeciesList) {
			if (first) {
				first = false;
			} else {
				sb.append(COMMA);
			}
			sb.append(headerSpecies);
		}
		final String bitsHeader = sb.toString();

		int timeStepsCompleted = 0;

		for (int i = 0; i < simulations; i++) {
			if (this.cancelled) {
				this.listener.stateUpdate(this.experimentId, SimulationState.CANCELLED);
				return;
			}

			/*
			 * csv bit strings to write out to the bits file.
			 */
			List<String> outputLines = new LinkedList<>();
			outputLines.add(bitsHeader);

			/*
			 * Complete the required simulation steps.
			 */
			for (int j = 0; j < this.runTime; j++) {
				if (this.cancelled) {
					this.listener.stateUpdate(this.experimentId, SimulationState.CANCELLED);
					return;
				}
				Map<String, Integer> speciesBitsMap = new HashMap<>();
				int timeStep = j + 1;
				for (Long speciesId : this.simulationSpecies.keySet()) {
					if (this.cancelled) {
						this.listener.stateUpdate(this.experimentId, SimulationState.CANCELLED);
						return;
					}
					DynamicSimulationSpecies dSpecies = this.simulationSpecies.get(speciesId);
					try {
						boolean state = this.evaluateSpecies(dSpecies, timeStep);
						int bit = (state) ? 1 : 0;
						speciesBitsMap.put(speciesIdToNameMap.get(speciesId), bit);
					} catch (Exception e) {
						logger.error("Failed to evaluate simulation species: " + speciesIdToNameMap.get(speciesId)
								+ " for experiment: " + this.experimentId + ".", e);
						this.listener.stateUpdate(this.experimentId, SimulationState.FAILED);
						return;
					}
				}

				sb = new StringBuilder();
				first = true;
				for (String headerSpecies : headerSpeciesList) {
					if (first) {
						first = false;
					} else {
						sb.append(COMMA);
					}
					sb.append(speciesBitsMap.get(headerSpecies));
				}
				outputLines.add(sb.toString());

				++timeStepsCompleted;
				synchronized (this.progress) {
					this.progress = (double) timeStepsCompleted / (double) totalTimeSteps;
					this.listener.progressUpdate(this.experimentId, getStatus());
				}
			}

			/*
			 * Generate the results for the current simulation.
			 */
			for (CalcInterval calcInterval : calcIntervals) {
				logger.info("Calculating experiment results for: {} ...", calcInterval.toString());
				final int from = (calcInterval.getFrom() == null) ? 0 : calcInterval.getFrom();
				Map<Long, Double> percentOnResultsMap = new HashMap<>();
				for (Long speciesId : this.simulationSpecies.keySet()) {
					DynamicSimulationSpecies species = this.simulationSpecies.get(speciesId);
					percentOnResultsMap.put(speciesId, species.calculateAverage(from, calcInterval.getTo()));
				}

				try {
					logger.info("Saving experiment data for: {}; simulation = {} ...", calcInterval.toString(),
							(i + 1));
					this.experimentDataDao.storeExperimentData(this.experimentId, (i + 1), calcInterval.getId(),
							percentOnResultsMap);
					logger.info("Successfully saved experiment data for: {}; simulation = {}.", calcInterval.toString(),
							(i + 1));
				} catch (Exception e) {
					logger.error("Failed to store the experiment data for: " + calcInterval.toString()
							+ "; simulation = " + (i + 1) + ".", e);
					this.listener.stateUpdate(this.experimentId, SimulationState.FAILED);
					return;
				}
			}

			for (DynamicSimulationSpecies species : simulationSpecies.values()) {
				/*
				 * We have reached the end of this simulation. Reset the
				 * simulation species.
				 */
				species.reset();
				if (this.initialActiveSpecies.contains(species.getId())) {
					species.setInitialState(true);
				}
			}

			final Path simulationBitsFilePath = this.experimentBitsPath
					.resolve(String.format(BITS_FILE_PATTERN, Integer.toString(i + 1)));
			try {
				Files.write(simulationBitsFilePath, outputLines);
			} catch (IOException e) {
				logger.error("Failed to write bits file: " + simulationBitsFilePath.toString() + ".", e);
			}
		}

		/*
		 * We have reached the end of the simulation.
		 */
		this.listener.stateUpdate(this.experimentId, SimulationState.COMPLETED);
	}

	@Override
	protected DynamicSimulationSpecies buildSimulationSpecies(Long speciesId, DynamicSimulationSettings settings) {
		final Map<Long, SpeciesMutation> mutations = settings.getMutations();

		ActivityLevelRange activityLevelRange = null;
		if (settings.getActivityLevelRange() != null) {
			activityLevelRange = settings.getActivityLevelRange().get(speciesId);
		}
		if (activityLevelRange == null) {
			activityLevelRange = ActivityLevelRange.getDefault();
		}
		SpeciesMutation mutation = SpeciesMutation.NONE;
		if (mutations != null) {
			if (mutations.containsKey(speciesId)) {
				mutation = mutations.get(speciesId);
			}
		}

		JSExpression expression = speciesExpressionMap.get(speciesId);
		DynamicSimulationSpecies dSpecies = null;
		if (expression == null) {
			dSpecies = new DynamicSimulationSpecies(speciesId, speciesIdToNameMap.get(speciesId), mutation,
					activityLevelRange, runTime);
		} else {
			dSpecies = new DynamicSimulationSpecies(speciesId, speciesIdToNameMap.get(speciesId),
					expression.getBooleanInputs(), expression.getBooleanInputIds(), expression.getBooleanExpression(),
					mutation, this.runTime);
		}

		if (this.initialActiveSpecies.contains(speciesId)) {
			dSpecies.setInitialState(true);
		}

		return dSpecies;
	}

	@Override
	protected boolean determineState(DynamicSimulationSpecies simulationSpecies) {
		/*
		 * Use the {@link ActivityLevelRange} to determine what the % of the
		 * {@link DynamicSimulationSpecies} being active are.
		 */
		final int percentOn = simulationSpecies.getPercentOn();
		if (percentOn == 0) {
			return false;
		} else if (percentOn == 100) {
			return true;
		}

		return (RandomUtil.getInstance().getRandomInt(100) < percentOn);
	}

	public DynamicSimulationStatus getStatus() {
		synchronized (this.progress) {
			return new DynamicSimulationStatus(this.progress, ((System.currentTimeMillis() - this.startTime) / 1000));
		}
	}

	public void setDataDao(ExperimentDataDao experimentDataDao, Path experimentBitsPath) {
		this.experimentDataDao = experimentDataDao;
		this.experimentBitsPath = experimentBitsPath;
	}
}