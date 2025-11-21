/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.CalcInterval;

/**
 * @author Bryan Kowal
 */
public interface CalcIntervalRepository extends JpaRepository<CalcInterval, Long> {

	public List<CalcInterval> findByIdIn(Collection<Long> ids);
	
}