/**
 * 
 */
package cc.dataaccess.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.user.User;

/**
 * @author bkowal
 *
 */
public interface UserRepository extends JpaRepository<User, Long> {

}