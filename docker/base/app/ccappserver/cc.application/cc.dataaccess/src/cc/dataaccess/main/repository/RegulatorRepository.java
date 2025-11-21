/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.biologic.Regulator;

/**
 * @author bkowal
 *
 */
public interface RegulatorRepository extends JpaRepository<Regulator, Long> {
}