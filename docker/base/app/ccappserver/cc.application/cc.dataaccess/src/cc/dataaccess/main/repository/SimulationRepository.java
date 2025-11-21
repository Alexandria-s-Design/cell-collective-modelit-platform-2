/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.model.ModelIdentifier;
import cc.common.data.simulation.Simulation;

/**
 * @author Bryan
 *
 */
public interface SimulationRepository extends JpaRepository<Simulation, Long> {

	@Query("SELECT s FROM Simulation s WHERE s.model = :model AND (s.userId = :userId OR s.published = 'TRUE' OR s.shared = 'TRUE')")
	public List<Simulation> getVisibleSimulationsForModelAuthenticated(@Param("model") ModelIdentifier model,
			@Param("userId") long userId);

	@Query("SELECT s FROM Simulation s WHERE s.model = :model AND (s.userId IS NULL OR s.published = 'TRUE')")
	public List<Simulation> getVisibleSimulationsForModelAnonymous(@Param("model") ModelIdentifier model);

}