/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.ModelReference;
import cc.dataaccess.main.repository.ModelReferenceRepository;

/**
 * @author Bryan Kowal
 *
 */
public class ModelReferenceDao {

	@Autowired
	private ModelReferenceRepository modelReferenceRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public ModelReferenceDao() {
	}

	public ModelReference getById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<ModelReference>() {
			@Override
			public ModelReference doInTransaction(TransactionStatus status) {
				return modelReferenceRepository.findOne(id);
			}
		});
	}
}