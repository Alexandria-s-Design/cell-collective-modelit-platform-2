/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.ModelComment;
import cc.dataaccess.main.repository.ModelCommentRepository;

/**
 * @author Bryan Kowal
 *
 */
public class ModelCommentDao {

	@Autowired
	private ModelCommentRepository modelCommentRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public ModelCommentDao() {
	}

	public ModelComment getForId(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<ModelComment>() {
			@Override
			public ModelComment doInTransaction(TransactionStatus status) {
				return modelCommentRepository.findOne(id);
			}
		});
	}
}