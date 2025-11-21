/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.biologic.SpeciesIdentifier;

/**
 * @author Bryan Kowal
 *
 */
public interface SpeciesIdentifierRepository extends
		JpaRepository<SpeciesIdentifier, Long> {
}