/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.ModelRating;
import cc.dataaccess.main.repository.ModelRatingRepository;

/**
 * @author Bryan Kowal
 *
 */
public class ModelRatingDao {

	@Autowired
	private ModelRatingRepository modelRatingRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public ModelRatingDao() {
	}

	public ModelRating getById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<ModelRating>() {
			@Override
			public ModelRating doInTransaction(TransactionStatus status) {
				return modelRatingRepository.findOne(id);
			}
		});
	}
}