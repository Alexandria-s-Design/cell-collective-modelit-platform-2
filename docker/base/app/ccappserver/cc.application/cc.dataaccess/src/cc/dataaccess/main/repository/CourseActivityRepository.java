/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.CourseActivity;

/**
 * @author Bryan Kowal
 */
public interface CourseActivityRepository extends JpaRepository<CourseActivity, Long> {

	public List<CourseActivity> findByIdIn(Collection<Long> ids);
	
}