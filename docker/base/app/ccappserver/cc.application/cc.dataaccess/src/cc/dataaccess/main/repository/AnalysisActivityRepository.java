/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.AnalysisActivity;

/**
 * @author Bryan Kowal
 */
public interface AnalysisActivityRepository extends JpaRepository<AnalysisActivity, Long> {

	public List<AnalysisActivity> findByParentIdIn(final Collection<Long> parentIds);

}