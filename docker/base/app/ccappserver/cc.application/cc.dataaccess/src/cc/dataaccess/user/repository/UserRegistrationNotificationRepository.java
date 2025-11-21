/**
 * 
 */
package cc.dataaccess.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.user.UserRegistrationNotification;

/**
 * @author Bryan Kowal
 */
public interface UserRegistrationNotificationRepository extends JpaRepository<UserRegistrationNotification, Long> {
}