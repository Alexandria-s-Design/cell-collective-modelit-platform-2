/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import cc.common.data.metadata.AbstractSetValue;

/**
 * @author Bryan Kowal
 * @param <T>
 *
 */
@NoRepositoryBean
public interface SetValueRepository<T extends AbstractSetValue<?>> extends JpaRepository<T, Long> {

}