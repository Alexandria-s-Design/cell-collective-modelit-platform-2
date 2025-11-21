/**
 * 
 */
package cc.dataaccess.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.user.Registration;

/**
 * @author Bryan
 */
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
}