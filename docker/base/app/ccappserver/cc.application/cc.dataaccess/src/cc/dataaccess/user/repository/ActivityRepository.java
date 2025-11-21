/**
 * 
 */
package cc.dataaccess.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.user.Activity;

/**
 * @author Bryan Kowal
 *
 */
public interface ActivityRepository extends JpaRepository<Activity, Long> {

}