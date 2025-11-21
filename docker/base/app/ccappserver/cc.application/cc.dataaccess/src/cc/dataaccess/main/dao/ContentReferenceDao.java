/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.knowledge.ContentReference;
import cc.dataaccess.main.repository.ContentReferenceRepository;

/**
 * @author Bryan Kowal
 *
 */
public class ContentReferenceDao {

	@Autowired
	private ContentReferenceRepository contentReferenceRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public ContentReferenceDao() {
	}

	public ContentReference getById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<ContentReference>() {
			@Override
			public ContentReference doInTransaction(TransactionStatus status) {
				return contentReferenceRepository.findOne(id);
			}
		});
	}
}