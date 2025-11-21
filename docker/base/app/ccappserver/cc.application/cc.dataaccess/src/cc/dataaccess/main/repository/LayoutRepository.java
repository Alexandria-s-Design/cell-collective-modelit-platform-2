/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.Layout;

/**
 * @author Bryan Kowal
 */
public interface LayoutRepository extends JpaRepository<Layout, Long> {

	public List<Layout> findByModelId(final long modelId);

}