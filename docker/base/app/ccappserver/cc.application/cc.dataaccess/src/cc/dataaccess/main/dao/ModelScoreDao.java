/**
 * 
 */
package cc.dataaccess.main.dao;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.Model;
import cc.common.data.model.ModelScore;
import cc.dataaccess.main.repository.ModelRepository;
import cc.dataaccess.main.repository.ModelScoreRepository;

/**
 * @author Bryan Kowal
 *
 */
public class ModelScoreDao {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ModelRepository modelRepository;

	@Autowired
	private ModelScoreRepository modelScoreRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public ModelScoreDao() {
	}

	public void saveScore(final ModelScore modelScore, final Model model) {
		this.transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				try {
					modelScoreRepository.save(modelScore);
					model.setUpdateDate(modelScore.getLastCalculationDate());
					modelRepository.save(model);
				} catch (Exception e) {
					status.setRollbackOnly();
					logger.error("Failed to save statistic: " + modelScore.toString() + ".", e);
				}
			}
		});
	}

	public ModelScore getScoreForModel(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<ModelScore>() {
			@Override
			public ModelScore doInTransaction(TransactionStatus status) {
				return modelScoreRepository.findOne(id);
			}
		});
	}
}