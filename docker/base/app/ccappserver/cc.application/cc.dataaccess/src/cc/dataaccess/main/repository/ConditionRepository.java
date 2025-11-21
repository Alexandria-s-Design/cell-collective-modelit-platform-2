/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.biologic.Condition;

/**
 * @author bkowal
 *
 */
public interface ConditionRepository extends JpaRepository<Condition, Long> {
}