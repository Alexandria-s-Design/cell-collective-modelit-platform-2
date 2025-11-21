/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.CourseRange;

/**
 * @author Bryan Kowal
 *
 */
public interface CourseRangeRepository extends JpaRepository<CourseRange, Long> {

	public List<CourseRange> findByIdIn(Collection<Long> ids);

}