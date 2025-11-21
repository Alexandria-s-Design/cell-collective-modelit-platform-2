/**
 * 
 */
package cc.dataaccess.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.user.AuthorityRequest;
import cc.common.data.user.AuthorityRequestId;

/**
 * @author Bryan Kowal
 *
 */
public interface AuthorityRequestRepository extends JpaRepository<AuthorityRequest, AuthorityRequestId> {

	public List<AuthorityRequest> findByToken(final String token);

	public AuthorityRequest findById(final AuthorityRequestId authorityRequestId);

	@Query(value="SELECT * FROM authority_request ar WHERE ar.userid = :userid",
			nativeQuery=true)
	public List<AuthorityRequest> findActiveAuthorityRequest(@Param("userid")final Long userid);
	
}