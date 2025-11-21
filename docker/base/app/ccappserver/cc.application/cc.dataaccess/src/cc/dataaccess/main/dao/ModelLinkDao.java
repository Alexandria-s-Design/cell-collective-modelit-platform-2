/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.ModelLink;
import cc.dataaccess.main.repository.ModelLinkRepository;

/**
 * @author Bryan Kowal
 */
public class ModelLinkDao {

	@Autowired
	private ModelLinkRepository modelLinkRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public ModelLink getForId(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<ModelLink>() {
			@Override
			public ModelLink doInTransaction(TransactionStatus status) {
				return modelLinkRepository.findOne(id);
			}
		});
	}

	public ModelLink getForAccessCode(final String accessCode) {
		return transactionTemplate.execute(new TransactionCallback<ModelLink>() {
			@Override
			public ModelLink doInTransaction(TransactionStatus status) {
				return modelLinkRepository.findByAccessCode(accessCode);
			}
		});
	}

	public List<ModelLink> getForModel(final Long modelId) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelLink>>() {
			@Override
			public List<ModelLink> doInTransaction(TransactionStatus status) {
				return modelLinkRepository.findByModelId(modelId);
			}
		});
	}

	public List<ModelLink> getForModelAndUserId(final Long modelId, final Long userId) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelLink>>() {
			@Override
			public List<ModelLink> doInTransaction(TransactionStatus status) {
				return modelLinkRepository.findByModelIdAndUserId(modelId, userId);
			}
		});
	}

	public List<ModelLink> getModelLinksForIds(Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelLink>>() {
			@Override
			public List<ModelLink> doInTransaction(TransactionStatus status) {
				List<ModelLink> retrieved = modelLinkRepository.findByIdIn(ids);
				if (CollectionUtils.isEmpty(retrieved)) {
					return Collections.emptyList();
				}
				return retrieved;
			}
		});
	}
}