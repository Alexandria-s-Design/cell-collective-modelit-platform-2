/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.biologic.Species;

/**
 * @author Helikar Lab1
 *
 */
public interface SpeciesRepository extends JpaRepository<Species, Long> {

	@Query("SELECT s.id, s.name, s.external, s.absentState, s.creationDate, s.updateDate FROM Species s WHERE s.id = :id")
	public Object getSpeciesRecordById(@Param("id") long id);
	
	@Query("SELECT s.id, s.name, s.external, s.absentState, s.creationDate, s.updateDate FROM Species s WHERE s.model.id = :modelId")
	public List<Object> getSpeciesRecordsForModel(@Param("modelId") long modelId);

	@Modifying
	@Query("DELETE FROM Species s WHERE s.id IN (:ids)")
	public void deleteSpeciesByIds(@Param("ids") Collection<Long> ids);
}