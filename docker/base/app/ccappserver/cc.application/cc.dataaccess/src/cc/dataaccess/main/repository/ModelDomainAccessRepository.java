/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.model.ModelDomainAccess;
import cc.common.data.model.ModelDomainAccessId;

/**
 * @author Bryan Kowal
 *
 */
public interface ModelDomainAccessRepository extends JpaRepository<ModelDomainAccess, ModelDomainAccessId> {

	@Query("SELECT mda FROM ModelDomainAccess mda WHERE mda.id.userId = :userId")
	public List<ModelDomainAccess> findByUserId(@Param("userId") Long userId);

	@Modifying
	@Query("DELETE FROM ModelDomainAccess mda WHERE mda.id.modelId = :modelId")
	public void deleteDomainAccessForModelId(@Param("modelId") Long modelId);

}