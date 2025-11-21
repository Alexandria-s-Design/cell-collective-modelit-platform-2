/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.ModelReference;

/**
 * @author Bryan Kowal
 */
public interface ModelReferenceRepository extends JpaRepository<ModelReference, Long> {

}