/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.simulation.ComponentPair;

/**
 * @author Bryan Kowal
 */
public interface ComponentPairRepository extends JpaRepository<ComponentPair, Long> {

	public List<ComponentPair> findByIdIn(Collection<Long> ids);

	@Query("SELECT DISTINCT cp FROM ComponentPair cp WHERE cp.firstComponentId IN :speciesIds OR cp.secondComponentId IN :speciesIds")
	public List<ComponentPair> getComponentPairsForSpecies(@Param("speciesIds") Collection<Long> speciesIds);

}