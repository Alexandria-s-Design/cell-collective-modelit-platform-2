/**
 * 
 */
package cc.application.main.thread.task;

import java.io.IOException;
import java.util.Calendar;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import cc.application.main.json.simulate.SimulateStatistic;
import cc.application.main.thread.AbstractScheduledTask;
import cc.common.data.ModelStatisticTypesConstants;
import cc.common.data.model.Model;
import cc.common.data.model.ModelScore;
import cc.common.data.model.ModelStatistic;
import cc.dataaccess.main.dao.ModelDao;
import cc.dataaccess.main.dao.ModelScoreDao;
import cc.dataaccess.main.dao.ModelStatisticDao;

/**
 * @author Bryan Kowal
 */
public class ModelScoreCalculator extends AbstractScheduledTask {

	private static final String NAME = "Model Score Calculator";

	private static final long INITIAL_DELAY = 1;

	// 6 hours
	private static final long DELAY = 360;

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ModelDao modelDao;

	@Autowired
	private ModelStatisticDao modelStatisticDao;

	@Autowired
	private ModelScoreDao modelScoreDao;

	private final ObjectMapper objectMapper = new ObjectMapper();

	public ModelScoreCalculator() {
		super(NAME, INITIAL_DELAY, DELAY, TimeUnit.MINUTES);
	}

	@Override
	public void run() {
		logger.info("Calculating Model Scores ...");
		/*
		 * Retrieve the model(s) that calculations need to be completed for.
		 */
		List<Long> modelIds = this.modelDao.identifyOutdatedScores();
		if (CollectionUtils.isEmpty(modelIds)) {
			logger.info("No Model Score updates are required.");
			return;
		}

		final Calendar calculationDate = Calendar.getInstance();
		logger.info("Calculating Model Score for: " + modelIds.size() + " Model(s) ...");
		for (Long modelId : modelIds) {
			Model model = this.modelDao.getModel(modelId);

			ModelScore score = this.modelScoreDao.getScoreForModel(modelId);
			int currentCitations = 0;
			int currentSimulations = 0;
			int currentEdits = 0;
			int currentDownloads = 0;
			if (score == null) {
				score = new ModelScore();
				score.setId(modelId);
				score.setModel(model.getModelIdentifier());
			} else {
				currentCitations = score.getCitations();
				currentSimulations = score.getSimulations();
				currentEdits = score.getEdits();
				currentDownloads = score.getDownloads();
			}

			/*
			 * Retrieve statistics to include in the calculation.
			 */
			List<ModelStatistic> recentStatistics = this.modelStatisticDao
					.getStatisticsForModel(model.getModelIdentifier(), score.getLastCalculationDate());
			for (ModelStatistic statistic : recentStatistics) {
				if (ModelStatisticTypesConstants.MODEL_EDIT_STAT.equals(statistic.getType())) {
					++currentEdits;
				} else if (ModelStatisticTypesConstants.MODEL_SIMULATE_STAT.equals(statistic.getType())) {
					SimulateStatistic simulateStatistic = null;
					try {
						simulateStatistic = objectMapper.readValue(statistic.getMetadata(), SimulateStatistic.class);
					} catch (IOException e) {
						logger.error("Failed to convert Simulate Statistic metadata: " + statistic.getMetadata() + ".",
								e);
						continue;
					}
					currentSimulations += simulateStatistic.getSimulations();
				} else if (ModelStatisticTypesConstants.MODEL_DOWNLOAD_STAT.equals(statistic.getType())) {
					++currentDownloads;
				}
			}

			/*
			 * Retrieve citation information.
			 */
			if (model.getCited() != null) {
				currentCitations = model.getCited();
			}

			score.setCitations(currentCitations);
			score.setSimulations(currentSimulations);
			score.setEdits(currentEdits);
			score.setDownloads(currentDownloads);
			if (currentCitations != 0 || currentSimulations != 0 || currentEdits != 0 || currentDownloads != 0) {
				// calculate the updated score.
				final double updatedScore = (0.3 * (double) currentCitations) + (0.0001 * (double) currentSimulations)
						+ (0.1 * (double) currentEdits) + (0.2 * (double) currentDownloads);
				score.setScore(updatedScore);
			}

			score.setLastCalculationDate(calculationDate);

			try {
				this.modelScoreDao.saveScore(score, model);
			} catch (Exception e) {
				logger.error("Failed to save Model Score: " + score.toString() + " for Model: " + modelId + ".", e);
				continue;
			}
			logger.info("Finished calculating Model Score: " + score.toString() + " for Model: " + modelId + ".");
		}
	}
}