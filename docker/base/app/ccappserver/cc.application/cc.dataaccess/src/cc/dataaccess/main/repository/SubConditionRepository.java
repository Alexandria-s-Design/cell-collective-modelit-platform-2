/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.biologic.SubCondition;

/**
 * @author bkowal
 *
 */
public interface SubConditionRepository extends
		JpaRepository<SubCondition, Long> {
}