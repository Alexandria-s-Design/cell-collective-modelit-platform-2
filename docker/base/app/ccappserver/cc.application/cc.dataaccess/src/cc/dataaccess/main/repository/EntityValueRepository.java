/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.metadata.EntityValue;
import cc.common.data.metadata.EntityValueId;

/**
 * @author Bryan Kowal
 *
 */
public interface EntityValueRepository extends JpaRepository<EntityValue, EntityValueId> {

	public List<EntityValue> findByIdIn(Collection<EntityValueId> ids);

}