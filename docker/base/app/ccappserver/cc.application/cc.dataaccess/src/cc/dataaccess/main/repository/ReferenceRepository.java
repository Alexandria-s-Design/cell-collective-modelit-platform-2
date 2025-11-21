/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.knowledge.Reference;

/**
 * @author Bryan Kowal
 */
public interface ReferenceRepository extends JpaRepository<Reference, Long> {

	public List<Reference> findByPmid(final String pmid);
	
	public List<Reference> findByDoi(final String doi);

	public List<Reference> findByText(final String text);

}