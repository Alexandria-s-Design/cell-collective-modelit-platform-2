/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.knowledge.Section;

/**
 * @author Bryan Kowal
 *
 */
public interface SectionRepository extends JpaRepository<Section, Long> {

}