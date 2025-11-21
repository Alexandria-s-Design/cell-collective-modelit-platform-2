/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.Upload;

/**
 * @author Bryan Kowal
 */
public interface UploadRepository extends JpaRepository<Upload, Long> {

	public List<Upload> findByUserId(Long userId);

}