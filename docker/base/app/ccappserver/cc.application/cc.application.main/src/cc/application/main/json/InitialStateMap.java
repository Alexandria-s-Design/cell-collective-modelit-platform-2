/**
 * 
 */
package cc.application.main.json;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.model.ModelIdentifier;
import cc.common.data.simulation.InitialState;
import cc.dataaccess.InitialStateSpeciesId;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class InitialStateMap extends InitialState {

	public InitialStateMap() {
	}

	public InitialStateMap(InitialState initialState) {
		super(initialState);
	}

	public InitialState constructNewInitialState() {
		InitialState initialState = new InitialState();
		initialState.setName(super.getName());
		initialState.setSpecies(super.getSpecies());

		return initialState;
	}

	public Map<String, InitialStateSpeciesId> buildSpeciesMap() {
		if (CollectionUtils.isEmpty(super.getSpecies())) {
			return Collections.emptyMap();
		}

		Map<String, InitialStateSpeciesId> speciesMap = new HashMap<>(super.getSpecies().size(), 1.0f);
		for (SpeciesIdentifier species : super.getSpecies()) {
			InitialStateSpeciesId initialStateSpecies = new InitialStateSpeciesId(this.getId(), species.getId());
			speciesMap.put(initialStateSpecies.toJSIdentifier(), initialStateSpecies);
		}
		return speciesMap;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@JsonIgnore
	@Override
	public ModelIdentifier getModel() {
		return super.getModel();
	}

	@JsonIgnore
	@Override
	public Set<SpeciesIdentifier> getSpecies() {
		return super.getSpecies();
	}
}