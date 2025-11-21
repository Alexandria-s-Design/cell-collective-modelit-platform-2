/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.UserModelRating;
import cc.common.data.model.UserModelRatingId;

/**
 * @author Bryan Kowal
 */
public interface UserModelRatingRepository extends JpaRepository<UserModelRating, UserModelRatingId> {
}