/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Calendar;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.model.ModelIdentifier;
import cc.common.data.model.ModelStatistic;

/**
 * @author Bryan Kowal
 *
 */
public interface ModelStatisticRepository extends JpaRepository<ModelStatistic, Long> {

	@Query("SELECT ms FROM ModelStatistic ms WHERE ms.model = :model")
	public List<ModelStatistic> getAllStatisticsForModel(@Param("model") ModelIdentifier model);

	@Query("SELECT ms FROM ModelStatistic ms WHERE ms.model = :model AND ms.creationDate > :creationDate")
	public List<ModelStatistic> getRecentStatisticsForModel(@Param("model") ModelIdentifier model,
			@Param("creationDate") Calendar creationDate);

}