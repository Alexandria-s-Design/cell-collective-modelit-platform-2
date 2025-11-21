/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import cc.common.data.biologic.Species;
import cc.common.data.biologic.Species.AbsentState;
import cc.dataaccess.main.repository.SpeciesRepository;

/**
 * @author bkowal
 *
 */
@Transactional(value = "mainTransactionManager")
public class SpeciesDao {

	@Autowired
	private SpeciesRepository speciesRepository;

	@Transactional(readOnly = true)
	public Species getSpecies(final long id) {
		Object returnValue = this.speciesRepository.getSpeciesRecordById(id);
		if (returnValue == null) {
			return null;
		}
		return buildSpeciesFromRecord((Object[]) returnValue);
	}

	public List<Species> getSpeciesForModel(final long modelId) {
		List<Object> objects = this.speciesRepository.getSpeciesRecordsForModel(modelId);
		if (CollectionUtils.isEmpty(objects)) {
			return Collections.emptyList();
		}
		List<Species> species = new ArrayList<>(objects.size());
		for (Object object : objects) {
			species.add(buildSpeciesFromRecord((Object[]) object));
		}
		return species;
	}

	private Species buildSpeciesFromRecord(Object[] objects) {
		Species species = new Species();
		species.setId((Long) objects[0]);
		species.setName((String) objects[1]);
		species.setExternal((Boolean) objects[2]);
		species.setAbsentState((AbsentState) objects[3]);
		species.setCreationDate((Calendar) objects[4]);
		species.setUpdateDate((Calendar) objects[5]);

		return species;
	}
}