/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.LayoutNode;

/**
 * @author Bryan Kowal
 */
public interface LayoutNodeRepository extends JpaRepository<LayoutNode, Long> {

	public List<LayoutNode> findByLayoutId(final long layoutId);

}