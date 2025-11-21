/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.ModelScore;

/**
 * @author Bryan Kowal
 */
public interface ModelScoreRepository extends JpaRepository<ModelScore, Long> {

}