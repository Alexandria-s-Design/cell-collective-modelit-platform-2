/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.metadata.Value;

/**
 * @author Bryan Kowal
 */
public interface ValueRepository extends JpaRepository<Value, Long> {
	
	public List<Value> findByIdIn(Collection<Long> ids);
	
}