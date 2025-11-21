/**
 * 
 */
package cc.dataaccess;

import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.biologic.SubCondition;

/**
 * @author Bryan
 *
 */
public class SubConditionSpecies extends SubConditionSpeciesId {

	private final SubCondition subCondition;

	private final SpeciesIdentifier species;

	public SubConditionSpecies(SubCondition subCondition, SpeciesIdentifier species) {
		this.subCondition = subCondition;
		this.species = species;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.dataaccess.SubConditionSpeciesId#getSubConditionId()
	 */
	@Override
	public long getSubConditionId() {
		return this.subCondition.getId();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.dataaccess.SubConditionSpeciesId#getSpeciesId()
	 */
	@Override
	public long getSpeciesId() {
		return this.species.getId();
	}
}