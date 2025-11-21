/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.ModelShareNotification;
import cc.dataaccess.main.repository.ModelShareNotificationRepository;

/**
 * @author Bryan Kowal
 */
public class ModelNotificationDao {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ModelShareNotificationRepository modelShareNotificationRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public List<ModelShareNotification> getAllModelShareNotifications() {
		return transactionTemplate.execute(new TransactionCallback<List<ModelShareNotification>>() {
			@Override
			public List<ModelShareNotification> doInTransaction(TransactionStatus status) {
				List<ModelShareNotification> results = modelShareNotificationRepository.findAll();
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public void persistNotificationResults(final Collection<ModelShareNotification> complete,
			final Collection<ModelShareNotification> failed) {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				try {
					if (!failed.isEmpty()) {
						modelShareNotificationRepository.save(failed);
					}
					if (!complete.isEmpty()) {
						modelShareNotificationRepository.delete(complete);
					}
				} catch (Exception e) {
					logger.error("Failed to persist Model Share Notification results.", e);
					status.setRollbackOnly();
				}
			}
		});
	}
}