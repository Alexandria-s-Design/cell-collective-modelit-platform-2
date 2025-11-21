/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.knowledge.Content;

/**
 * @author Bryan Kowal
 */
public interface ContentRepository extends JpaRepository<Content, Long> {

}