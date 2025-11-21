/**
 * 
 */
package cc.application.main.controller;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import cc.application.main.exception.EntityNotFoundException;
import cc.application.main.exception.ModelAccessDeniedException;
import cc.application.main.json.simulate.SimulateStatistic;
import cc.application.main.json.simulate.SimulateStatistic.SimulationType;
import cc.common.data.ModelStatisticTypesConstants;
import cc.common.data.model.Model;
import cc.common.data.model.ModelStatistic;
import cc.common.data.simulation.Experiment;
import cc.common.data.simulation.ExperimentData;
import cc.common.data.simulation.SimulationDataWrapper;
import cc.dataaccess.main.dao.ExperimentDataDao;
import cc.dataaccess.main.dao.ModelStatisticDao;

/**
 * @author Bryan
 */
@Controller
@RequestMapping(AbstractSimulationController.SIMULATE)
public class SimulationController extends AbstractSimulationController {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ExperimentDataDao experimentDataDao;

	@Autowired
	private ModelStatisticDao modelStatisticDao;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@RequestMapping(value = "/get/{id}",
			method = RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> getSimulation(@PathVariable Long id, ServletResponse res,
			@RequestParam(value = "bits",
					required = false) boolean bits) {
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

		/*
		 * Retrieve the data.
		 */
		List<ExperimentData> allData = this.experimentDataDao.retrieveExperimentData(id);
		if (CollectionUtils.isEmpty(allData)) {
			return new ResponseEntity<Object>("Unable to find data for Experiment with id: " + id + ".",
					HttpStatus.NOT_FOUND);
		}

		final Map<Long, Map<Long, List<Double>>> experimentDataMap = new HashMap<>();
		for (int i = 0; i < allData.size(); i++) {
			SimulationDataWrapper dataWrapper = null;
			ExperimentData data = allData.get(i);
			try {
				dataWrapper = this.experimentDataDao.dataFromXml(data.getData());
			} catch (Exception e) {
				logger.error("Failed to read data for experiment: " + id + "!", e);
				return new ResponseEntity<Object>("Failed to read data for experiment: " + id + "!",
						HttpStatus.INTERNAL_SERVER_ERROR);
			}

			final long calcIntervalId = data.getId().getCalcIntervalId();
			if (!experimentDataMap.containsKey(calcIntervalId)) {
				experimentDataMap.put(calcIntervalId, new HashMap<>());
			}
			for (Long speciesId : dataWrapper.getDataMap().keySet()) {
				if (!experimentDataMap.get(calcIntervalId).containsKey(speciesId)) {
					experimentDataMap.get(calcIntervalId).put(speciesId, new LinkedList<>());
				}
				experimentDataMap.get(calcIntervalId).get(speciesId).add(dataWrapper.getDataMap().get(speciesId));
			}
		}

		this.addCacheControlResponse(res);
		if (bits == false) {
			return new ResponseEntity<Object>(experimentDataMap, HttpStatus.OK);
		}

		return new ResponseEntity<Object>(experimentDataMap, HttpStatus.OK);
	}

	@RequestMapping(value = "/save/{id}",
			method = RequestMethod.POST,
			consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Object> saveExperiment(@PathVariable Long id,
			@RequestBody final Map<Long, Map<Long, List<Double>>> calcIntervalExperimentDataMap) {
		if (CollectionUtils.isEmpty(calcIntervalExperimentDataMap)) {
			return new ResponseEntity<Object>("No data to save.", HttpStatus.OK);
		}

		/*
		 * Verify that the user has access to the {@link Experiment}.
		 */
		Experiment experiment = this.experimentDao.getById(id);
		if (experiment == null) {
			return new ResponseEntity<Object>("Unable to find Experiment with id: " + id + ".", HttpStatus.NOT_FOUND);
		}
		ResponseEntity<Object> accessResponse = this.verifyExperimentAccess(experiment);
		if (accessResponse != null) {
			return accessResponse;
		}

		logger.info("Saving data for Experiment {} ...", id);

		Map<Long, List<SimulationDataWrapper>> simulationDataMap = new HashMap<>();
		Iterator<Long> calcIntervalIdIterator = calcIntervalExperimentDataMap.keySet().iterator();
		while (calcIntervalIdIterator.hasNext()) {
			Long calcIntervalId = calcIntervalIdIterator.next();
			Map<Long, List<Double>> experimentDataMap = calcIntervalExperimentDataMap.get(calcIntervalId);

			List<SimulationDataWrapper> simulationDataList = new LinkedList<>();
			final int simulationCount = experimentDataMap.values().iterator().next().size();
			for (int i = 0; i < simulationCount; i++) {
				Map<Long, Double> dataMap = new HashMap<>();
				Iterator<Long> speciesIdIterator = experimentDataMap.keySet().iterator();
				while (speciesIdIterator.hasNext()) {
					Long speciesId = speciesIdIterator.next();
					dataMap.put(speciesId, experimentDataMap.get(speciesId).get(i));
				}

				simulationDataList.add(new SimulationDataWrapper(dataMap));
			}

			simulationDataMap.put(calcIntervalId, simulationDataList);
		}

		Model model = this.modelDao.getModel(experiment.getId());

		try {
			this.experimentDataDao.storeAllExperimentData(model, experiment, simulationDataMap);
		} catch (Exception e) {
			logger.error("Failed to save data for Experiment: " + id + ".", e);
			return new ResponseEntity<Object>("Failed to save simulation data.", HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return new ResponseEntity<Object>("Simulation data saved.", HttpStatus.OK);
	}

	@RequestMapping(value = "/stats/{id}",
			method = RequestMethod.GET)
	public ResponseEntity<Object> simulateStats(@PathVariable Long id, @RequestParam(value = "simulations",
			required = true) Integer simulations,
			@RequestParam(value = "type",
					required = true) SimulationType type,
			@RequestParam(value = "runtime",
					required = false) Long runtime) {
		Model model = null;
		try {
			model = this.verifyModelExistenceAndAccess(id, this.getAuthenticatedUserId());
		} catch (EntityNotFoundException e) {
			logger.error("Failed to access Model: " + id.longValue() + "!", e);
			return new ResponseEntity<Object>(e.getMessage(), HttpStatus.NOT_FOUND);
		} catch (ModelAccessDeniedException e) {
			logger.error("Failed to access Model: " + id.longValue() + "!", e);
			return new ResponseEntity<Object>(e.getMessage(), HttpStatus.FORBIDDEN);
		} catch (Exception e) {
			logger.error("Failed to access Model: " + id.longValue() + "!", e);
			return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

		ModelStatistic statistic = new ModelStatistic();
		statistic.setModel(model.getModelIdentifier());
		statistic.setCreationDate(Calendar.getInstance());
		statistic.setUserId(this.getAuthenticatedUserId());
		statistic.setType(ModelStatisticTypesConstants.MODEL_SIMULATE_STAT);

		SimulateStatistic simulateStatistic = new SimulateStatistic();
		simulateStatistic.setType(type);
		simulateStatistic.setSimulations(simulations.intValue());
		if (runtime != null) {
			simulateStatistic.setRuntime(runtime.longValue());
		}
		String metadata = null;
		try {
			metadata = objectMapper.writeValueAsString(simulateStatistic);
		} catch (JsonProcessingException e) {
			logger.error("Failed to convert Simulate Statistic metadata to JSON for Model: " + id.intValue() + ".", e);
			return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
		statistic.setMetadata(metadata);
		this.modelStatisticDao.saveStatistic(statistic);

		return new ResponseEntity<Object>("Simulation stats saved.", HttpStatus.OK);
	}
}