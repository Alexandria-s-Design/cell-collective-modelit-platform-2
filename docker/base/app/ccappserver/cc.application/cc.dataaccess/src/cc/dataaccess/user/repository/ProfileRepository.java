/**
 * 
 */
package cc.dataaccess.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.user.Profile;

/**
 * @author Bryan
 */
public interface ProfileRepository extends JpaRepository<Profile, Long> {

	@Query("SELECT p FROM Profile p WHERE lower(p.email) = lower(:email)")
	public Profile findByEmail(@Param("email") final String email);

	public Profile findByUserId(final Long userId);

	@Query("SELECT p.email FROM Profile p WHERE lower(p.email) = lower(:email)")
	public Object verifyEmailUniqueness(@Param("email") final String email);

}