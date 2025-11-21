/**
 * 
 */
package cc.dataaccess.main.dao;

import java.io.ByteArrayOutputStream;
import java.io.StringReader;
import java.nio.charset.Charset;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.Model;
import cc.common.data.simulation.Experiment;
import cc.common.data.simulation.ExperimentData;
import cc.common.data.simulation.ExperimentDataPK;
import cc.common.data.simulation.SimulationDataWrapper;
import cc.common.data.simulation.SimulationState;
import cc.dataaccess.main.repository.ExperimentDataRepository;
import cc.dataaccess.main.repository.ExperimentRepository;
import cc.dataaccess.main.repository.ModelRepository;

/**
 * @author Bryan Kowal
 */
public class ExperimentDataDao {

	@Autowired
	private ExperimentDataRepository experimentDataRepository;

	@Autowired
	private ExperimentRepository experimentRepository;

	@Autowired
	private ModelRepository modelRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	private final JAXBContext context;

	public ExperimentDataDao() {
		try {
			this.context = JAXBContext.newInstance(SimulationDataWrapper.class);
		} catch (JAXBException e) {
			throw new RuntimeException("Failed to initialize the JAXB Context!", e);
		}
	}

	public void storeExperimentData(final long experimentId, final long simulation, final Long calcIntervalId,
			Map<Long, Double> dataMap) throws Exception {
		this.transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				ExperimentData data = new ExperimentData(
						new ExperimentDataPK(experimentId, simulation, calcIntervalId));
				try {
					data.setData(dataToXml(new SimulationDataWrapper(dataMap)));
					experimentDataRepository.save(data);
				} catch (Exception e) {
					status.setRollbackOnly();
					throw new RuntimeException("Failed to save the experiment data!", e);
				}
			}
		});
	}

	public void storeAllExperimentData(final Model model, final Experiment experiment,
			Map<Long, List<SimulationDataWrapper>> simulationDataMap) throws Exception {
		this.transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				try {
					Iterator<Long> calcIntervalIdIterator = simulationDataMap.keySet().iterator();
					while (calcIntervalIdIterator.hasNext()) {
						Long calcIntervalId = calcIntervalIdIterator.next();
						List<SimulationDataWrapper> simulationDataList = simulationDataMap.get(calcIntervalId);
						int simulation = 0;
						for (SimulationDataWrapper dataWrapper : simulationDataList) {
							++simulation;
							ExperimentData data = new ExperimentData(
									new ExperimentDataPK(experiment.getId(), simulation, calcIntervalId));
							data.setData(dataToXml(dataWrapper));
							experimentDataRepository.save(data);
						}
					}

					if (experiment.getState() != SimulationState.COMPLETED) {
						experiment.setState(SimulationState.COMPLETED);
					}
					Calendar currentDate = Calendar.getInstance();
					experiment.setLastRunDate(currentDate);
					experimentRepository.save(experiment);
					if (model != null) {
						modelRepository.updateModelRecord(model.getId(), currentDate);
					}
				} catch (Exception e) {
					status.setRollbackOnly();
					throw new RuntimeException("Failed to save the experiment data for: " + experiment.toString() + ".",
							e);
				}
			}
		});
	}

	public List<ExperimentData> retrieveExperimentData(final Long experimentId) {
		return transactionTemplate.execute(new TransactionCallback<List<ExperimentData>>() {
			@Override
			public List<ExperimentData> doInTransaction(TransactionStatus status) {
				/*
				 * Update the {@link Experiment} last access time.
				 */
				Experiment experiment = experimentRepository.findOne(experimentId);
				if (experiment != null) {
					experiment.setLastAccessDate(Calendar.getInstance());
					experimentRepository.save(experiment);
				}

				return experimentDataRepository.getDataForSimulation(experimentId);
			}
		});
	}

	public String dataToXml(final SimulationDataWrapper dataWrapper) throws Exception {
		final Marshaller marshaller = this.context.createMarshaller();
		ByteArrayOutputStream baos = new ByteArrayOutputStream();

		marshaller.marshal(dataWrapper, baos);
		return baos.toString(Charset.defaultCharset().name());
	}

	public SimulationDataWrapper dataFromXml(final String xml) throws Exception {
		final Unmarshaller unmarshaller = this.context.createUnmarshaller();
		final StringReader stringReader = new StringReader(xml);

		return (SimulationDataWrapper) unmarshaller.unmarshal(stringReader);
	}
}