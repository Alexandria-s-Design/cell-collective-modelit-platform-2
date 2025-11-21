/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.LearningActivityGroup;

/**
 * @author Ales Saska
 */
public interface LearningActivityGroupRepository extends JpaRepository<LearningActivityGroup, Long> {

	public List<LearningActivityGroup> findByMasterId(final long masterId);

	public List<LearningActivityGroup> findByMasterIdIn(final Iterable<Long> masterIds);

}