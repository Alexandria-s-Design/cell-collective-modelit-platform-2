/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.UserModelRating;
import cc.common.data.model.UserModelRatingId;
import cc.dataaccess.main.repository.UserModelRatingRepository;

/**
 * @author Bryan Kowal
 *
 */
public class UserModelRatingDao {

	@Autowired
	private UserModelRatingRepository userModelRatingRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public UserModelRatingDao() {
	}

	public UserModelRating getUserModelRating(final UserModelRatingId id) {
		return transactionTemplate.execute(new TransactionCallback<UserModelRating>() {
			@Override
			public UserModelRating doInTransaction(TransactionStatus status) {
				return userModelRatingRepository.findOne(id);
			}
		});
	}
}