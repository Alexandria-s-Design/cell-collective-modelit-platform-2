/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.knowledge.Content;
import cc.dataaccess.main.repository.ContentRepository;

/**
 * @author Bryan Kowal
 *
 */
public class ContentDao {

	@Autowired
	private ContentRepository contentRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public ContentDao() {
	}

	public Content getById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<Content>() {
			@Override
			public Content doInTransaction(TransactionStatus status) {
				return contentRepository.findOne(id);
			}
		});
	}
}