/**
 * 
 */
package cc.dataaccess.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.user.AnonymousUser;

/**
 * @author Bryan Kowal
 */
public interface AnonymousUserRepository extends JpaRepository<AnonymousUser, Long> {

	public List<AnonymousUser> findByIpAndUserAgent(final String ip, final String userAgent);

}