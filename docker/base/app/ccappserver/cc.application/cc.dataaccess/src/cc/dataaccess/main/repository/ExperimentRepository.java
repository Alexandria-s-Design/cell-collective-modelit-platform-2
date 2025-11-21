/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.simulation.Experiment;

/**
 * @author Bryan Kowal
 *
 */
public interface ExperimentRepository extends JpaRepository<Experiment, Long> {

	@Query("SELECT e FROM Experiment e WHERE e.model_id = :modelId AND (e.userId = :userId OR e.published = true OR e.shared = true)")
	public List<Experiment> getVisibleExperimentsForAuthenticated(@Param("modelId") final Long modelId,
			@Param("userId") long userId);

	@Query("SELECT e FROM Experiment e WHERE e.model_id = :modelId AND (e.userId IS NULL OR e.published = true)")
	public List<Experiment> getVisibleExperimentsAnonymous(@Param("modelId") final Long modelId);

	public List<Experiment> findByIdIn(Collection<Long> ids);

}