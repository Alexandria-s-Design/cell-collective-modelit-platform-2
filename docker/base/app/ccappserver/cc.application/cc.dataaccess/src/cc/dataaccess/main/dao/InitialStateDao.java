/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.simulation.InitialState;
import cc.dataaccess.main.repository.InitialStateRepository;

/**
 * @author Bryan Kowal
 */
public class InitialStateDao {

	@Autowired
	private InitialStateRepository initialStateRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public InitialState getInitialState(final long id) {
		return transactionTemplate.execute(new TransactionCallback<InitialState>() {
			@Override
			public InitialState doInTransaction(TransactionStatus status) {
				return initialStateRepository.findOne(id);
			}
		});
	}
}