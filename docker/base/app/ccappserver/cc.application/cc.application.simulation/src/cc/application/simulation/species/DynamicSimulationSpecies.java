/**
 * 
 */
package cc.application.simulation.species;

import java.util.Collections;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;

import cc.application.simulation.RandomUtil;
import cc.common.data.simulation.SpeciesMutation;
import cc.common.simulate.settings.dynamic.ActivityLevelRange;

/**
 * @author Bryan
 *
 */
public class DynamicSimulationSpecies extends AbstractSimulationSpecies {

	private final ActivityLevelRange activityLevelRange;

	private final List<Boolean> stateHistory;

	private final long id;

	private int percentOn;

	public DynamicSimulationSpecies(final long id, String name, SpeciesMutation mutation,
			final ActivityLevelRange activityLevelRange, final int runTime) {
		super(name, Collections.emptySet(), Collections.emptySet(), null, mutation);
		this.id = id;
		this.activityLevelRange = activityLevelRange;
		this.stateHistory = new ArrayList<>(runTime);
		this.calculatePercentOn();
	}

	public DynamicSimulationSpecies(final long id, String name, Set<String> inputSpecies, Set<Long> inputSpeciesIds,
			String expression, SpeciesMutation mutation, int runTime) {
		super(name, inputSpecies, inputSpeciesIds, expression, mutation);
		this.id = id;
		this.activityLevelRange = null;
		this.stateHistory = new ArrayList<>(runTime);
	}

	private void calculatePercentOn() {
		if (this.activityLevelRange == null) {
			return;
		}
		if (this.getMutation() == SpeciesMutation.ON) {
			this.percentOn = 100;
		} else if (this.getMutation() == SpeciesMutation.OFF) {
			this.percentOn = 0;
		} else {
			percentOn = RandomUtil.getInstance().getRandomIntInRange(this.activityLevelRange.getMinimum(),
					this.activityLevelRange.getMaximum());
		}
	}

	@Override
	public boolean isCurrent(int timeStep) {
		boolean isCurrent = (this.timeStep >= timeStep);
		if (isCurrent == false) {
			this.previousState = this.currentState;
			this.timeStep = timeStep;
			this.stateHistory.add(this.previousState);
		}
		return isCurrent;
	}

	public double calculateAverage(final int from, final int to) {
		int onCount = 0;
		int totalCount = to - from;
		for (int i = from; i < to; i++) {
			if (this.stateHistory.get(i)) {
				++onCount;
			}
		}

		return ((double) onCount / (double) totalCount) * 100;
	}

	public void reset() {
		this.timeStep = 0;
		this.stateHistory.clear();
		this.previousState = false;
		this.currentState = false;
		if (this.activityLevelRange == null) {
			return;
		}
		this.calculatePercentOn();
	}

	public long getId() {
		return id;
	}

	/**
	 * @return the percentOn
	 */
	public int getPercentOn() {
		return percentOn;
	}

	/**
	 * @return the activityLevelRange
	 */
	public ActivityLevelRange getActivityLevelRange() {
		return activityLevelRange;
	}
}