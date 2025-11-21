/**
 * 
 */
package cc.dataaccess;

import cc.common.data.biologic.ConditionIdentifier;
import cc.common.data.biologic.SpeciesIdentifier;

/**
 * @author Bryan
 *
 */
public class ConditionSpecies extends ConditionSpeciesId {

	private final ConditionIdentifier condition;

	private final SpeciesIdentifier species;

	public ConditionSpecies(ConditionIdentifier condition, SpeciesIdentifier species) {
		this.condition = condition;
		this.species = species;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.dataaccess.ConditionSpeciesId#getConditionId()
	 */
	@Override
	public long getConditionId() {
		return this.condition.getId();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.dataaccess.ConditionSpeciesId#getSpeciesId()
	 */
	@Override
	public long getSpeciesId() {
		return this.species.getId();
	}
}