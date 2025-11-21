/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.AnalysisEnvironment;

/**
 * @author Bryan Kowal
 */
public interface AnalysisEnvironmentRepository extends JpaRepository<AnalysisEnvironment, Long> {

	public List<AnalysisEnvironment> findBymodelidAndUserId(final long modelId, final long userId);

}