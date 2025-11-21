/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.CourseMutation;

/**
 * @author Bryan Kowal
 *
 */
public interface CourseMutationRepository extends JpaRepository<CourseMutation, Long> {

	public List<CourseMutation> findByIdIn(Collection<Long> ids);

}