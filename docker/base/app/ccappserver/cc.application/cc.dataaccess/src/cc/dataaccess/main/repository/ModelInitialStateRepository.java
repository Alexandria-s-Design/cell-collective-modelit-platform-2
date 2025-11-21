/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.ModelInitialState;

/**
 * @author Bryan Kowal
 */
public interface ModelInitialStateRepository extends JpaRepository<ModelInitialState, Long> {

}