/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.Calendar;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.ModelIdentifier;
import cc.common.data.model.ModelStatistic;
import cc.dataaccess.main.repository.ModelStatisticRepository;

/**
 * @author Bryan Kowal
 *
 */
public class ModelStatisticDao {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ModelStatisticRepository modelStatisticRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public ModelStatisticDao() {
	}

	public void saveStatistic(final ModelStatistic statistic) {
		this.transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				try {
					modelStatisticRepository.save(statistic);
				} catch (Exception e) {
					status.setRollbackOnly();
					logger.error("Failed to save statistic: " + statistic.toString() + ".", e);
				}
			}
		});
	}

	public List<ModelStatistic> getStatisticsForModel(final ModelIdentifier model, final Calendar creationDate) {
		return this.transactionTemplate.execute(new TransactionCallback<List<ModelStatistic>>() {
			@Override
			public List<ModelStatistic> doInTransaction(TransactionStatus status) {
				if (creationDate == null) {
					return modelStatisticRepository.getAllStatisticsForModel(model);
				} else {
					return modelStatisticRepository.getRecentStatisticsForModel(model, creationDate);
				}
			}
		});
	}
}