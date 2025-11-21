/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.LearningActivity;

/**
 * @author Bryan Kowal
 */
public interface LearningActivityRepository extends JpaRepository<LearningActivity, Long> {

	public List<LearningActivity> findByMasterId(final long masterId);

	public List<LearningActivity> findByMasterIdIn(final Iterable<Long> masterIds);

}