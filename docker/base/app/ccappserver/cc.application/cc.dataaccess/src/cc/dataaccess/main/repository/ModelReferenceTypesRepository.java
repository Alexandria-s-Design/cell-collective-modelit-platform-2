/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.knowledge.ModelReferenceTypes;

/**
 * @author Bryan Kowal
 */
public interface ModelReferenceTypesRepository extends JpaRepository<ModelReferenceTypes, Long> {

	public List<ModelReferenceTypes> findByModelId(final long modelId);
	
}