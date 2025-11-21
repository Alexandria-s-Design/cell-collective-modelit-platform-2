/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.ModelIdentifier;

/**
 * @author Bryan Kowal
 */
public interface ModelIdentifierRepository extends JpaRepository<ModelIdentifier, Long> {

}