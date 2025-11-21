/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.biologic.RegulatorIdentifier;

/**
 * @author Bryan Kowal
 *
 */
public interface RegulatorIdentifierRepository extends
		JpaRepository<RegulatorIdentifier, Long> {
}