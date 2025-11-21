/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.ModelComment;

/**
 * @author Bryan Kowal
 *
 */
public interface ModelCommentRepository extends JpaRepository<ModelComment, Long> {
}