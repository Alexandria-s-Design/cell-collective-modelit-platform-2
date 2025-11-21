/**
 * 
 */
package cc.dataaccess;

import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.simulation.InitialState;

/**
 * @author Bryan Kowal
 *
 */
public class InitialStateSpecies extends InitialStateSpeciesId {

	private final InitialState initialState;

	private final SpeciesIdentifier species;

	public InitialStateSpecies(InitialState initialState, SpeciesIdentifier species) {
		this.initialState = initialState;
		this.species = species;
	}

	@Override
	public long getInitialStateId() {
		return this.initialState.getId();
	}

	@Override
	public long getSpeciesId() {
		return this.species.getId();
	}
}