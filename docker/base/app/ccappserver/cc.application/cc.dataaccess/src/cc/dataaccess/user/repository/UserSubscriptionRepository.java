/**
 * 
 */
package cc.dataaccess.user.repository;

import java.util.Calendar;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.user.UserSubscription;

/**
 * @author Bryan Kowal
 */
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

	@Query("SELECT u FROM UserSubscription u WHERE u.userId = :userId AND u.expirationDate >= :currentDate ORDER BY u.expirationDate DESC")
	public List<UserSubscription> getActiveSubscriptions(@Param("userId") final Long userId,
			@Param("currentDate") final Calendar currentDate);

}