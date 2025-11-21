/**
 * 
 */
package cc.dataaccess.main.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import cc.common.data.biologic.Regulator;
import cc.dataaccess.main.repository.RegulatorRepository;

/**
 * @author bkowal
 *
 */
@Transactional(value = "mainTransactionManager")
public class RegulatorDao {

	@Autowired
	private RegulatorRepository regulatorRepository;

	@Transactional(readOnly = true)
	public Regulator getRegulator(final long id) {
		return this.regulatorRepository.findOne(id);
	}
}