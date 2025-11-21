/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.knowledge.PageReference;
import cc.dataaccess.main.repository.PageReferenceRepository;

/**
 * @author Bryan Kowal
 *
 */
public class PageReferenceDao {

	@Autowired
	private PageReferenceRepository pageReferenceRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public PageReferenceDao() {
	}

	public PageReference getById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<PageReference>() {
			@Override
			public PageReference doInTransaction(TransactionStatus status) {
				return pageReferenceRepository.findOne(id);
			}
		});
	}
}