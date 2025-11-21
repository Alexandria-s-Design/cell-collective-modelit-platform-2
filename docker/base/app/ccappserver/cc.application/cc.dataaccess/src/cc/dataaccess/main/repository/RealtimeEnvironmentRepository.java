/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.RealtimeEnvironment;

/**
 * @author Bryan Kowal
 */
public interface RealtimeEnvironmentRepository extends JpaRepository<RealtimeEnvironment, Long> {

	public List<RealtimeEnvironment> findBymodelidAndUserId(final long modelId, final long userId);
	
}