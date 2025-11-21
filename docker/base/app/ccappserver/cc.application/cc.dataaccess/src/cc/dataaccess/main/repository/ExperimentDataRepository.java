/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.simulation.ExperimentData;
import cc.common.data.simulation.ExperimentDataPK;

/**
 * @author Bryan Kowal
 *
 */
public interface ExperimentDataRepository extends JpaRepository<ExperimentData, ExperimentDataPK> {

	@Query("SELECT d FROM ExperimentData d WHERE d.id.experiment_id = :experimentId ORDER BY d.id.simulation, d.id.calcIntervalId")
	public List<ExperimentData> getDataForSimulation(@Param("experimentId") final Long experimentId);

}