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

import cc.common.data.model.ModelShare;
import cc.common.data.model.ModelShare.SHARE_ACCESS;
import cc.dataaccess.main.repository.ModelShareRepository;

/**
 * @author Bryan Kowal
 */
public class ModelShareDao {

	@Autowired
	private ModelShareRepository modelShareRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public ModelShareDao() {
	}

	public ModelShare getForId(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<ModelShare>() {
			@Override
			public ModelShare doInTransaction(TransactionStatus status) {
				return modelShareRepository.findOne(id);
			}
		});
	}

	public List<ModelShare> getForModel(final Long modelId) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelShare>>() {
			@Override
			public List<ModelShare> doInTransaction(TransactionStatus status) {
				return modelShareRepository.getSharesForModel(modelId);
			}
		});
	}

	public ModelShare getShareAccess(final Long userId, final Long modelId) {
		return getShareAccess(userId, modelId, null);
	}

	public ModelShare getShareAccess(final Long userId, final Long modelId, final List<ModelShare> shareListPrefetch) {
		return transactionTemplate.execute(new TransactionCallback<ModelShare>() {
			@Override
			public ModelShare doInTransaction(TransactionStatus status) {
				List<ModelShare> shareList = shareListPrefetch != null ? shareListPrefetch : modelShareRepository.getShareAccess(userId, modelId);
				ModelShare greatestShare = null;
				for (ModelShare ms : shareList) {
					if (greatestShare == null) {
						greatestShare = ms;
					} else {
						if (greatestShare.getAccess() == SHARE_ACCESS.VIEW
								&& (ms.getAccess() == SHARE_ACCESS.EDIT || ms.getAccess() == SHARE_ACCESS.ADMIN)) {
							greatestShare = ms;
						} else if (greatestShare.getAccess() == SHARE_ACCESS.EDIT
								&& ms.getAccess() == SHARE_ACCESS.ADMIN) {
							greatestShare = ms;
							break;
						}
					}
				}

				return greatestShare;
			}
		});
	}

	public List<ModelShare> getModelSharesForIds(Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelShare>>() {
			@Override
			public List<ModelShare> doInTransaction(TransactionStatus status) {
				List<ModelShare> retrieved = modelShareRepository.findByIdIn(ids);
				if (CollectionUtils.isEmpty(retrieved)) {
					return Collections.emptyList();
				}
				return retrieved;
			}
		});
	}

	public List<ModelShare> getShareForUserAndModelLink(final Long userId, final Long modelLinkId) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelShare>>() {
			@Override
			public List<ModelShare> doInTransaction(TransactionStatus status) {
				return modelShareRepository.getShareForUserAndModelLink(userId, modelLinkId);
			}
		});
	}

	public List<ModelShare> getShareForUserAndModelIds(final Long userId, final Iterable<Long> modelIds) {
		if (!modelIds.iterator().hasNext()) {
			return Collections.emptyList();
		}
		return transactionTemplate.execute(new TransactionCallback<List<ModelShare>>() {
			@Override
			public List<ModelShare> doInTransaction(TransactionStatus status) {
				return modelShareRepository.getShareAccessForModels(userId, modelIds);
			}
		});
	}
}