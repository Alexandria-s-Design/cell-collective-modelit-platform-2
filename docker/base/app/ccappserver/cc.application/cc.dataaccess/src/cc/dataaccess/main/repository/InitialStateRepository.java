/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.simulation.InitialState;

/**
 * @author Bryan Kowal
 *
 */
public interface InitialStateRepository extends JpaRepository<InitialState, Long> {
}