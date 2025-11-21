/**
 * 
 */
package cc.dataaccess;

import java.util.List;

import cc.common.data.biologic.Condition;
import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.Species;
import cc.common.data.biologic.SubCondition;

import java.util.ArrayList;

/**
 * @author Bryan
 *
 */
public class BiologicRemovalMapping {

	private final List<Long> deletedSpecies = new ArrayList<>();

	private final List<Long> deletedRegulators = new ArrayList<>();

	private final List<Long> deletedConditions = new ArrayList<>();

	private final List<Long> deletedSubConditions = new ArrayList<>();

	/**
	 * 
	 */
	public BiologicRemovalMapping() {
	}

	public void addDeletedSpecies(final Species species) {
		this.deletedSpecies.add(species.getId());
	}

	public boolean shouldDeleteSpecies(final Species species) {
		return this.deletedSpecies.contains(species.getId()) == false;
	}

	public void addDeletedRegulator(final Regulator regulator) {
		this.deletedRegulators.add(regulator.getId());
	}

	public boolean shouldDeleteRegulator(final Regulator regulator) {
		return this.deletedRegulators.contains(regulator.getId()) == false;
	}

	public boolean wasRegulatorDeleted(final Regulator regulator) {
		return this.deletedRegulators.contains(regulator.getId());
	}

	public void addDeletedCondition(final Condition condition) {
		this.deletedConditions.add(condition.getId());
	}

	public boolean shouldDeleteCondition(final Condition condition) {
		return this.deletedConditions.contains(condition.getId()) == false;
	}

	public void addDeletedSubCondition(final SubCondition subCondition) {
		this.deletedSubConditions.add(subCondition.getId());
	}

	public boolean shouldDeleteSubCondition(final SubCondition subCondition) {
		return this.deletedSubConditions.contains(subCondition.getId()) == false;
	}
}