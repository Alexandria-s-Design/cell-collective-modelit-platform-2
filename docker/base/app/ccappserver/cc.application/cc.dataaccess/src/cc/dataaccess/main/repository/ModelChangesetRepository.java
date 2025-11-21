/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.ModelChangeset;

/**
 * @author Bryan Kowal
 *
 */
public interface ModelChangesetRepository extends JpaRepository<ModelChangeset, Long> {

}