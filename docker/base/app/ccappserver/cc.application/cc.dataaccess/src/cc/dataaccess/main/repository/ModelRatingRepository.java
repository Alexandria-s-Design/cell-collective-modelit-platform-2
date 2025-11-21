/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.ModelRating;

/**
 * @author Bryan Kowal
 */
public interface ModelRatingRepository extends JpaRepository<ModelRating, Long> {
}