/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.knowledge.PageReference;

/**
 * @author Bryan Kowal
 *
 */
public interface PageReferenceRepository extends JpaRepository<PageReference, Long> {

}