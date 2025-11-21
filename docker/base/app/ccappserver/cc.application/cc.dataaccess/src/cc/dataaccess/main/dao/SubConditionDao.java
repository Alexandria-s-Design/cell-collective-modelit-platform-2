/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import cc.common.data.biologic.SubCondition;
import cc.dataaccess.main.repository.SubConditionRepository;

/**
 * @author bkowal
 *
 */
@Transactional(value = "mainTransactionManager")
public class SubConditionDao {

	@Autowired
	private SubConditionRepository subConditionRepository;

	@Transactional(readOnly = true)
	public SubCondition getSubCondition(final long id) {
		return this.subConditionRepository.findOne(id);
	}
}