/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.knowledge.ContentReference;

/**
 * @author Bryan Kowal
 */
public interface ContentReferenceRepository extends JpaRepository<ContentReference, Long> {

}