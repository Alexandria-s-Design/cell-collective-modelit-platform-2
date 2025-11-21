/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import cc.common.data.biologic.Condition;
import cc.dataaccess.main.repository.ConditionRepository;

/**
 * @author bkowal
 *
 */
@Transactional(value = "mainTransactionManager")
public class ConditionDao {

	@Autowired
	private ConditionRepository conditionRepository;

	@Transactional(readOnly = true)
	public Condition getCondition(final long id) {
		return this.conditionRepository.findOne(id);
	}
}