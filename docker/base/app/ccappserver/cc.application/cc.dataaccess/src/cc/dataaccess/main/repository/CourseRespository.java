/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.Course;

/**
 * @author Bryan Kowal
 */
public interface CourseRespository extends JpaRepository<Course, Long> {

	public List<Course> findByIdIn(Collection<Long> ids);

}