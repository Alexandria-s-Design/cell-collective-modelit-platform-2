/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.model.ModelShare;

/**
 * @author Bryan Kowal
 *
 */
public interface ModelShareRepository extends JpaRepository<ModelShare, Long> {

	@Query("SELECT m From ModelShare m WHERE m.model_id = :modelId")
	public List<ModelShare> getSharesForModel(@Param("modelId") final Long modelId);

	@Query("SELECT m FROM ModelShare m WHERE m.userId = :userId AND m.model_id = :modelId")
	public List<ModelShare> getShareAccess(@Param("userId") final Long userId, @Param("modelId") final Long modelId);

	@Query("SELECT m FROM ModelShare m WHERE m.userId = :userId AND m.model_id IN :modelId")
	public List<ModelShare> getShareAccessForModels(@Param("userId") final Long userId, @Param("modelId") final Iterable<Long> modelId);

	@Query("SELECT m FROM ModelShare m WHERE lower(m.email) = lower(:email)")
	public List<ModelShare> findByEmail(@Param("email") final String email);

	@Query("SELECT m FROM ModelShare m WHERE m.userId = :userId AND m.modelLinkId = :modelLinkId")
	public List<ModelShare> getShareForUserAndModelLink(@Param("userId") final Long userId,
			@Param("modelLinkId") final Long modelLinkId);

	public List<ModelShare> findByIdIn(Collection<Long> ids);
}