/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.RealtimeActivity;

/**
 * @author Bryan Kowal
 *
 */
public interface RealtimeActivityRepository extends JpaRepository<RealtimeActivity, Long> {
	
	public List<RealtimeActivity> findByParentIdIn(final Collection<Long> parentIds);

}