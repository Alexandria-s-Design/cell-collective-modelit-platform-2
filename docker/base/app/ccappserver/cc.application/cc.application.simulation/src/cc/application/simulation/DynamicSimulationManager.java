/**
 * 
 */
package cc.application.simulation;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;

import cc.application.simulation.configuration.SimulationConfiguration;
import cc.application.simulation.configuration.SimulationConfigurationManager;
import cc.application.simulation.executor.DynamicSimulationExecutor;
import cc.application.simulation.executor.DynamicSimulationStatus;
import cc.application.simulation.executor.IDynamicSimulationProgressListener;
import cc.common.data.biologic.Species;
import cc.common.data.model.Model;
import cc.common.data.simulation.CalcInterval;
import cc.common.data.simulation.SimulationState;
import cc.common.simulate.settings.dynamic.DynamicSimulationSettings;
import cc.dataaccess.main.dao.ExperimentDao;
import cc.dataaccess.main.dao.ExperimentDataDao;

/**
 * @author Bryan
 */
public class DynamicSimulationManager extends AbstractSimulationManager implements IDynamicSimulationProgressListener {

	private static final String EXPERIMENT_DIRECTORY = "experiment";

	public static final String BITS_DIRECTORY = "bits";

	@Autowired
	private ExperimentDataDao experimentDataDao;

	@Autowired
	private ExperimentDao experimentDao;

	private final Map<Long, DynamicSimulationExecutor> activeSimulations = new HashMap<>();

	private final ConcurrentMap<Long, DynamicSimulationStatus> simulationProgressMap = new ConcurrentHashMap<>();

	private final Path experimentDataDirectoryPath;

	/*
	 * TODO: need to implement purging and scheduling.
	 */
	private final ConcurrentMap<Long, DynamicSimulationStatus> finishedSimulationStatusCache = new ConcurrentHashMap<>();

	private static final List<SimulationState> END_STATES = Arrays.asList(SimulationState.COMPLETED,
			SimulationState.CANCELLED, SimulationState.FAILED);

	/**
	 * @param maxSimulationsCount
	 */
	public DynamicSimulationManager(final SimulationConfigurationManager configurationManager) {
		this(configurationManager.getConfiguration(), configurationManager.getFileManager().getCcDataPath());
	}

	public DynamicSimulationManager(final SimulationConfiguration configuration, final Path dataPath) {
		super(configuration.getMaxDynamicSimulationCount());
		this.experimentDataDirectoryPath = dataPath.resolve(EXPERIMENT_DIRECTORY);

		if (Files.exists(experimentDataDirectoryPath)) {
			return;
		}
		logger.info("Creating experiment data directory: {} ...", this.experimentDataDirectoryPath.toString());
		try {
			Files.createDirectories(experimentDataDirectoryPath);
		} catch (IOException e) {
			throw new RuntimeException(
					"Failed to create experiment data directory: " + this.experimentDataDirectoryPath.toString() + ".",
					e);
		}
		logger.info("Successfully created experiment data directory: {}.", this.experimentDataDirectoryPath.toString());
	}

	public void startSimulation(final Long experimentId, DynamicSimulationSettings settings,
			final Collection<CalcInterval> calcIntervals, final int runTime, final Model model) throws Exception {
		/*
		 * Verify there are sufficient simulation resources available.
		 */
		if (this.activeSimulations.size() == this.maxSimulations) {
			throw new Exception("Insufficient Simulation Resources!");
		}

		/*
		 * Create the {@link Species} alias mapping.
		 */
		final Map<Long, String> jsVariableMap = this.buildJSVariableMap(model);
		final Map<Long, String> speciesIdToNameMap = new HashMap<>(model.getSpecies().size(), 1.0f);
		for (Species species : model.getSpecies()) {
			speciesIdToNameMap.put(species.getId(), species.getName());
		}

		/*
		 * Construct the {@link Species} boolean expressions.
		 */
		final Map<Long, JSExpression> speciesExpressionMap = this.constructJSExpressionMap(jsVariableMap, model);
		synchronized (this.activeSimulations) {
			DynamicSimulationExecutor executor = new DynamicSimulationExecutor(experimentId, jsVariableMap,
					speciesExpressionMap, settings, calcIntervals, runTime, this, speciesIdToNameMap);
			final Path experimentBitsPath = this.getExperimentBitsPath(experimentId);
			if (Files.exists(experimentBitsPath)) {
				logger.info("Purging existing experiment bits data directory {} ...", experimentBitsPath.toString());
				try {
					FileUtils.deleteDirectory(experimentBitsPath.toFile());
					logger.info("Successfully purged experiment bits data directory: {}.",
							experimentBitsPath.toString());
				} catch (IOException e) {
					logger.error("Failed to purge existing experiment bits data directory: "
							+ experimentBitsPath.toString() + ".", e);
					throw new Exception("Failed to remove existing experiment bits data directory!");
				}
			}
			logger.info("Creating experiment bits data directory {} ...", experimentBitsPath.toString());
			try {
				Files.createDirectories(experimentBitsPath);
				logger.info("Successfully created experiment bits data directory: {}.", experimentBitsPath.toString());
			} catch (IOException e) {
				logger.error("Failed to create experiment bits data directory: " + experimentBitsPath.toString() + ".",
						e);
				throw new Exception("Failed to create experiment bits data directory!");
			}
			executor.setDataDao(this.experimentDataDao, experimentBitsPath);

			this.activeSimulations.put(experimentId, executor);
			/*
			 * Schedule the simulation.
			 */
			this.simulationExecutorService.submit(executor);
		}
	}

	public Path getExperimentBitsPath(final Long experimentId) {
		return this.experimentDataDirectoryPath.resolve(Long.toString(experimentId)).resolve(BITS_DIRECTORY);
	}

	public void stopSimulation(final Long experimentId) {
		synchronized (this.activeSimulations) {
			DynamicSimulationExecutor executor = this.activeSimulations.get(experimentId);
			if (executor == null) {
				return;
			}
			executor.stop();
			this.stateUpdate(experimentId, SimulationState.CANCELLED);
		}
	}

	public DynamicSimulationStatus getStatus(final long id) {
		synchronized (this.activeSimulations) {
			final DynamicSimulationStatus status = this.simulationProgressMap.get(id);
			return (status == null) ? this.finishedSimulationStatusCache.get(id) : status;
		}
	}

	@Override
	public void stateUpdate(final long id, final SimulationState state) {
		logger.info("Updating experiment state: [ id = {}, state = {} ].", id, state.toString());
		if (END_STATES.contains(state)) {
			synchronized (this.activeSimulations) {
				DynamicSimulationExecutor executor = this.activeSimulations.remove(id);
				DynamicSimulationStatus status = executor.getStatus();
				if (status != null) {
					logger.info("Experiment {} has concluded: [ duration = {}ms ].", id, status.getElapsedTime());
				}
				// TODO: eliminate after the status retrieval method has been
				// updated.
				this.finishedSimulationStatusCache.put(id, status);
				this.simulationProgressMap.remove(id);
			}
		}
		this.experimentDao.updateState(id, state);
	}

	@Override
	public void progressUpdate(final long id, final DynamicSimulationStatus status) {
		this.simulationProgressMap.put(id, status);
	}
}