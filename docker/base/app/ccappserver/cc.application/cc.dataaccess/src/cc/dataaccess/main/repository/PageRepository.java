/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import cc.common.data.knowledge.Page;

/**
 * @author Bryan Kowal
 *
 */
public interface PageRepository extends JpaRepository<Page, Long> {

	public List<Page> findByIdIn(Collection<Long> ids);

	@Query("SELECT DISTINCT p.id, p.creationDate, p.creationUser, p.updateDate, p.updateUser FROM Page p WHERE p.id IN (:ids)")
	public List<Object> getPageRecordsForIdIn(Collection<Long> ids);

}