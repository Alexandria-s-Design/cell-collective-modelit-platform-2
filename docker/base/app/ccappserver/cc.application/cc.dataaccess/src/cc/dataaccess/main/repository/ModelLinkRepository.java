/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.model.ModelLink;

/**
 * @author Bryan Kowal
 *
 */
public interface ModelLinkRepository extends JpaRepository<ModelLink, Long> {

	public ModelLink findByAccessCode(String accessCode);

	@Query("SELECT ml FROM ModelLink ml WHERE ml.model_id = :modelId")
	public List<ModelLink> findByModelId(@Param("modelId") final Long modelId);

	@Query("SELECT ml FROM ModelLink ml WHERE ml.model_id = :modelId and ml.userId = :userId")
	public List<ModelLink> findByModelIdAndUserId(@Param("modelId") final Long modelId, @Param("userId") Long userId);

	public List<ModelLink> findByIdIn(Collection<Long> ids);
}