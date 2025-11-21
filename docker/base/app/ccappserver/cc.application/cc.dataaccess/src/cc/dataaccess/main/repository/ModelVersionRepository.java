/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.model.ModelVersion;
import cc.common.data.model.ModelVersionId;

/**
 * @author Bryan Kowal
 */
public interface ModelVersionRepository extends JpaRepository<ModelVersion, ModelVersionId> {

	@Query("SELECT mv FROM ModelVersion mv WHERE mv.id.id IN (:modelVersionIds) ORDER BY mv.id.id, mv.id.version DESC")
	public List<ModelVersion> getPossibleVersionsForModels(
			@Param("modelVersionIds") final Collection<Long> modelVersionIds);

	@Query("SELECT mv FROM ModelVersion mv WHERE mv.modelId = :modelId ORDER BY mv.selected")
	public List<ModelVersion> getVersionForModel(@Param("modelId") final Long modelId, final Pageable pageable);

	@Query("SELECT mv FROM ModelVersion mv WHERE mv.id.id IN (SELECT mv2.id.id FROM ModelVersion mv2 WHERE mv2.modelId = :modelId)")
	public List<ModelVersion> getAllVersionsForVersionModelId(@Param("modelId") final Long modelId);

	@Query("SELECT mv FROM ModelVersion mv WHERE mv.id.id = :versionId ORDER BY mv.id.version DESC")
	public List<ModelVersion> getLatestVersionForModelVersionId(@Param("versionId") final Long versionId,
			final Pageable pageable);
	
	@Query("SELECT mv FROM ModelVersion mv WHERE mv.id.id = :versionId AND mv.selected = 'true' ORDER BY mv.id.version DESC")
	public List<ModelVersion> getSelectedModelVersions(@Param("versionId") final Long versionId);

	@Query("SELECT mv FROM ModelVersion mv WHERE mv.id.id = :versionId ORDER BY mv.selected DESC, mv.id.version DESC")
	public ModelVersion getSelectedOrLatest(@Param("versionId") final Long versionId);
}