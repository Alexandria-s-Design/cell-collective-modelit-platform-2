/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.metadata.Definition;
import cc.dataaccess.main.repository.DefinitionRepository;

/**
 * @author Bryan Kowal
 *
 */
public class DefinitionDao {

	@Autowired
	private DefinitionRepository definitionRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public DefinitionDao() {
	}

	public List<Definition> getAllDefinitions() {
		return transactionTemplate.execute(new TransactionCallback<List<Definition>>() {
			@Override
			public List<Definition> doInTransaction(TransactionStatus status) {
				return definitionRepository.findAll();
			}
		});
	}
}