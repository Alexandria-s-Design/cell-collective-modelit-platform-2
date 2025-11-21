/**
 * 
 */
package cc.dataaccess.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.user.Role;
import cc.common.data.user.Role.USER_ROLE;

/**
 * @author Bryan
 */
public interface RoleRepository extends JpaRepository<Role, Long> {

	public Role getByName(final USER_ROLE name);

}