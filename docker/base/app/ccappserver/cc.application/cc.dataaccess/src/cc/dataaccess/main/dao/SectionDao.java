/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.knowledge.Section;
import cc.dataaccess.main.repository.SectionRepository;

/**
 * @author Bryan Kowal
 *
 */
public class SectionDao {

	@Autowired
	private SectionRepository sectionRepository;
	
	@Autowired
	private TransactionTemplate transactionTemplate;
	
	public SectionDao() {
	}
	
	public Section getById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<Section>() {
			@Override
			public Section doInTransaction(TransactionStatus status) {
				return sectionRepository.findOne(id);
			}
		});
	}
}