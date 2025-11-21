/**
 * 
 */
package cc.application.main.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.function.Consumer;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import cc.application.main.exception.EntityNotFoundException;
import cc.application.main.exception.ModelAccessDeniedException;
import cc.application.simulation.DynamicSimulationManager;
import cc.application.simulation.executor.DynamicSimulationStatus;
import cc.common.data.biologic.Species;
import cc.common.data.model.Model;
import cc.common.data.simulation.AnalysisActivity;
import cc.common.data.simulation.AnalysisEnvironment;
import cc.common.data.simulation.CalcInterval;
import cc.common.data.simulation.Experiment;
import cc.common.data.simulation.InitialState;
import cc.common.data.simulation.SimulationState;
import cc.common.simulate.settings.SimulationSettingsJAXBManager;
import cc.common.simulate.settings.dynamic.ActivityLevelRange;
import cc.common.simulate.settings.dynamic.DynamicSimulationSettings;
import cc.dataaccess.main.dao.SpeciesDao;

/**
 * @author Bryan
 */
@Controller
@RequestMapping(AbstractSimulationController.SIMULATE + "/dynamic")
public class DynamicSimulationController extends AbstractSimulationController {

	@Autowired
	private DynamicSimulationManager dynamicSimulationManager;

	@Autowired
	private SpeciesDao speciesDao;

	@RequestMapping(value = "/start", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> startExperiment(
			@RequestParam(value = "id", required = true) long[] experimentIds) {
		final Long userId = getAuthenticatedUserId();

		/*
		 * Verify that the user has access to all of the requested experiments.
		 */
		final Set<Long> experimentIdList = new HashSet<>(experimentIds.length, 1.0f);
		for (long experimentId : experimentIds) {
			experimentIdList.add(experimentId);
		}

		final List<Experiment> experiments = this.experimentDao.getExperimentsForIds(experimentIdList);
		if (CollectionUtils.isEmpty(experiments)) {
			return new ResponseEntity<Object>("Failed to find Experiment with id: " + experimentIds[0] + "!",
					HttpStatus.NOT_FOUND);
		}

		final Map<Experiment, Model> experimentsToSimulateMap = new HashMap<>(experiments.size(), 1.0f);
		for (Experiment experiment : experiments) {
			/*
			 * Verify that the user owns the experiment.
			 */
			boolean accessDenied = (experiment.getUserId() == null && userId != null)
					|| (experiment.getUserId() != null && !experiment.getUserId().equals(userId));
			if (accessDenied) {
				return new ResponseEntity<Object>(
						"User does not have permission to simulate experiment: " + experiment.getId() + "!",
						HttpStatus.FORBIDDEN);
			}
			/*
			 * Retrieve the associated {@link Model}.
			 */
			Model model = null;
			try {
				model = this.verifyModelExistenceAndAccess(experiment.getModel_id(), userId);
			} catch (EntityNotFoundException e) {
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.NOT_FOUND);
			} catch (ModelAccessDeniedException e) {
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.FORBIDDEN);
			} catch (Exception e) {
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
			experimentsToSimulateMap.put(experiment, model);
		}

		Map<Long, Boolean> experimentStatus = new HashMap<>(experimentIds.length, 1.0f);
		for (Experiment experiment : experimentsToSimulateMap.keySet()) {
			Model model = experimentsToSimulateMap.get(experiment);

			/*
			 * Retrieve the experiment settings.
			 */
			DynamicSimulationSettings settings = null;
			try {
				settings = (DynamicSimulationSettings) SimulationSettingsJAXBManager.getInstance()
						.fromXMLString(experiment.getSettings());
			} catch (Exception e) {
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
			}

			/*
			 * Retrieve any analysis activity levels (if applicable).
			 */
			if (experiment.getEnvironmentId() != null) {
				final List<Long> environmentIds = new ArrayList<>(1);
				environmentIds.add(experiment.getEnvironmentId());
				final List<AnalysisActivity> analysisActivities = experimentDao
						.getAnalysisActivitiesByEnvironmentIds(environmentIds);
				if (CollectionUtils.isNotEmpty(analysisActivities)) {
					Map<Long, ActivityLevelRange> activityLevelRange = new HashMap<>(analysisActivities.size(), 1.0f);
					for (AnalysisActivity analysisActivity : analysisActivities) {
						activityLevelRange.put(analysisActivity.getComponentId(), new ActivityLevelRange(
								analysisActivity.getMin().intValue(), analysisActivity.getMax().intValue()));
					}
					settings.setActivityLevelRange(activityLevelRange);
				}
			}

			if (settings.getInitialStateId() != null) {
				InitialState initialState = null;
				initialState = this.initialStateDao.getInitialState(settings.getInitialStateId());
				if (initialState == null) {
					return new ResponseEntity<Object>(
							"Failed to find Initial State with id: " + settings.getInitialStateId() + "!",
							HttpStatus.NOT_FOUND);
				}
				settings.setInitialState(initialState);
			}
			/*
			 * Ensure that calc ranges have been provided and that none are unbound.
			 */
			if (CollectionUtils.isEmpty(experiment.getCalcIntervals())) {
				return new ResponseEntity<Object>(
						"Failed to run experiment: " + experiment.getId() + "! No calc intervals have been defined.",
						HttpStatus.BAD_REQUEST);
			}
			int runTime = Integer.MIN_VALUE;
			for (CalcInterval calcInterval : experiment.getCalcIntervals()) {
				if (calcInterval.getTo() == null) {
					/*
					 * Unbounded Calc Interval discovered.
					 */
					return new ResponseEntity<Object>("Failed to run experiment: " + experiment.getId() + "! "
							+ calcInterval.toString() + " is unbound.", HttpStatus.BAD_REQUEST);
				}
				runTime = Integer.max(runTime, calcInterval.getTo());
			}

			try {
				logger.info("Preparing to start: {} ...", experiment.toString());
				this.dynamicSimulationManager.startSimulation(experiment.getId(), settings,
						experiment.getCalcIntervals(), runTime, model);
				experimentStatus.put(experiment.getId(), true);
			} catch (Exception e) {
				logger.error("Failed to start Experiment with id: " + experiment.getId() + ".", e);
				experimentStatus.put(experiment.getId(), false);
			}
		}

		return new ResponseEntity<Object>(experimentStatus, HttpStatus.OK);
	}

	@RequestMapping(value = "/export/{id}", method = RequestMethod.GET, produces = "application/zip")
	public @ResponseBody ResponseEntity<Object> exportExperimentBits(@PathVariable Long id) {
		/*
		 * Retrieve the specified {@link Experiment}.
		 */
		Experiment experiment = this.experimentDao.getById(id);
		if (experiment == null) {
			return new ResponseEntity<Object>("Unable to find Experiment with id: " + id + ".", HttpStatus.NOT_FOUND);
		}
		ResponseEntity<Object> accessResponse = this.verifyExperimentAccess(experiment);
		if (accessResponse != null) {
			return accessResponse;
		}

		final Path experimentBitsPath = dynamicSimulationManager.getExperimentBitsPath(experiment.getId());
		if (!Files.exists(experimentBitsPath)) {
			return new ResponseEntity<Object>(
					"Unable to find bit data for Experiment with id: " + experiment.getId() + "!",
					HttpStatus.NOT_FOUND);
		}

		final ByteArrayOutputStream baos = new ByteArrayOutputStream();
		ZipArchiveOutputStream zaos = new ZipArchiveOutputStream(baos);
		try {
			Files.list(experimentBitsPath).forEach(new Consumer<Path>() {
				@Override
				public void accept(Path path) {
					ZipArchiveEntry entry = new ZipArchiveEntry(Paths
							.get(DynamicSimulationManager.BITS_DIRECTORY, path.getFileName().toString()).toString());
					byte[] bitsBytes = null;
					try {
						bitsBytes = Files.readAllBytes(path);
						entry.setSize(bitsBytes.length);
						zaos.putArchiveEntry(entry);
						zaos.write(bitsBytes);
						zaos.closeArchiveEntry();
					} catch (IOException e) {
						throw new RuntimeException(e);
					}
				}
			});
			zaos.finish();
			zaos.close();
			baos.close();
		} catch (IOException e) {
			logger.error("Failed to export the bits for Experiment: " + experiment.getId() + ".", e);
			return new ResponseEntity<Object>("Experiment Export Failed!", HttpStatus.INTERNAL_SERVER_ERROR);
		}

		HttpHeaders headers = new HttpHeaders();
		headers.set("Content-Disposition", "attachment; filename=" + Long.toString(id) + ".zip");
		headers.setContentLength(baos.size());

		return new ResponseEntity<Object>(baos.toByteArray(), headers, HttpStatus.CREATED);
	}

	@RequestMapping(value = "/status", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> getModel(
			@RequestParam(value = "id", required = true) long[] experimentIds) {
		List<Experiment> experimentsFound = new ArrayList<>(experimentIds.length);
		for (long experimentId : experimentIds) {
			final Experiment experiment = this.experimentDao.getById(experimentId);
			if (experiment == null) {
				return new ResponseEntity<Object>("Failed to find Experiment with id: " + experimentId + "!",
						HttpStatus.NOT_FOUND);
			}

			ResponseEntity<Object> accessResponse = this.verifyExperimentAccess(experiment);
			if (accessResponse != null) {
				return accessResponse;
			}

			experimentsFound.add(experiment);
		}

		Map<Long, DynamicSimulationStatus> experimentStatusMap = new HashMap<>(experimentsFound.size(), 1.0f);
		for (Experiment experiment : experimentsFound) {
			if (experiment.getState() == null) {
				experimentStatusMap.put(experiment.getId(), null);
			} else if (experiment.getState() == SimulationState.RUNNING) {
				experimentStatusMap.put(experiment.getId(),
						this.dynamicSimulationManager.getStatus(experiment.getId()));
			} else {
				experimentStatusMap.put(experiment.getId(), new DynamicSimulationStatus(experiment.getState()));
			}
		}

		return new ResponseEntity<Object>(experimentStatusMap, HttpStatus.OK);
	}

	@RequestMapping(value = "/convertExprSettings", method = RequestMethod.GET)
	public @ResponseBody ResponseEntity<Object> convertExperimentSettings() {
		List<Experiment> allExperiments = experimentDao.getAllExperiments();
		for (Experiment experiment : allExperiments) {
			if (experiment.getSettings() == null) {
				continue;
			}
			logger.info("Converting: {} ...", experiment.toString());

			DynamicSimulationSettings settings = null;
			try {
				settings = (DynamicSimulationSettings) SimulationSettingsJAXBManager.getInstance()
						.fromXMLString(experiment.getSettings());
			} catch (Exception e) {
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
			if (MapUtils.isEmpty(settings.getActivityLevelRange())) {
				continue;
			}

			AnalysisEnvironment analysisEnvironment = new AnalysisEnvironment();
			analysisEnvironment.setName("Environment " + experiment.getId());
			analysisEnvironment.setModelid(experiment.getModel_id());
			if (experiment.getUserId() == null) {
				continue;
			}
			analysisEnvironment.setUserId(experiment.getUserId());
			Set<AnalysisActivity> analysisActivitities = new HashSet<>();
			for (Entry<Long, ActivityLevelRange> entry : settings.getActivityLevelRange().entrySet()) {
				/*
				 * Verify that the component still exists.
				 */
				Species species = speciesDao.getSpecies(entry.getKey());
				if (species == null) {
					continue;
				}
				AnalysisActivity analysisActivity = new AnalysisActivity();
				analysisActivity.setComponentId(entry.getKey());
				ActivityLevelRange activityLevelRange = entry.getValue();
				analysisActivity.setMin(new Double(activityLevelRange.getMinimum()));
				analysisActivity.setMax(new Double(activityLevelRange.getMaximum()));
				analysisActivitities.add(analysisActivity);
			}
			experimentDao.saveAnalysisEnvironment(analysisEnvironment, analysisActivitities);
		}

		return new ResponseEntity<Object>("Complete!", HttpStatus.OK);
	}
}