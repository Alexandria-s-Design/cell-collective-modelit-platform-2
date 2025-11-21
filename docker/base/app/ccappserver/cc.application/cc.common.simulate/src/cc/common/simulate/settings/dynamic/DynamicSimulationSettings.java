/**
 * 
 */
package cc.common.simulate.settings.dynamic;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

import cc.common.data.simulation.InitialState;
import cc.common.data.simulation.SpeciesMutation;
import cc.common.simulate.settings.IInitialSimulationSettings;

/**
 * @author Bryan
 *
 */
@XmlRootElement(name = "dynamicSimulationSettings")
public class DynamicSimulationSettings implements IInitialSimulationSettings, IDynamicSimulationSettings, Serializable {

	private static final long serialVersionUID = 4736392292223018204L;

	private int simulations;
	
	private Map<Long, ActivityLevelRange> activityLevelRange;

	private Map<Long, SpeciesMutation> mutations;

	private Long initialStateId;

	private boolean bits;

	private Long x;

	private Set<Long> y;

	@XmlTransient
	private InitialState initialState;

	public DynamicSimulationSettings() {
	}

	public DynamicSimulationSettings(String simulationName, int simulations, Map<Long, SpeciesMutation> mutations,
			InitialState initialState) {
		this.simulations = simulations;
		this.mutations = mutations;
		this.initialState = initialState;
		if (initialState != null) {
			this.initialStateId = initialState.getId();
		}
	}

	/**
	 * @return the simulations
	 */
	@Override
	public int getSimulations() {
		return simulations;
	}

	/**
	 * @param simulations
	 *            the simulations to set
	 */
	@Override
	public void setSimulations(int simulations) {
		this.simulations = simulations;
	}

	/**
	 * @return the activityLevelRange
	 */
	@Override
	public Map<Long, ActivityLevelRange> getActivityLevelRange() {
		return activityLevelRange;
	}

	/**
	 * @param activityLevelRange
	 *            the activityLevelRange to set
	 */
	@Override
	public void setActivityLevelRange(Map<Long, ActivityLevelRange> activityLevelRange) {
		this.activityLevelRange = activityLevelRange;
	}

	/**
	 * @return the mutations
	 */
	@Override
	public Map<Long, SpeciesMutation> getMutations() {
		return mutations;
	}

	/**
	 * @param mutations
	 *            the mutations to set
	 */
	@Override
	public void setMutations(Map<Long, SpeciesMutation> mutations) {
		this.mutations = mutations;
	}

	/**
	 * @return the initialStateId
	 */
	@Override
	public Long getInitialStateId() {
		return initialStateId;
	}

	/**
	 * @param initialStateId
	 *            the initialStateId to set
	 */
	@Override
	public void setInitialStateId(Long initialStateId) {
		this.initialStateId = initialStateId;
	}

	/**
	 * @return the bits
	 */
	@Override
	public boolean isBits() {
		return bits;
	}

	/**
	 * @param bits
	 *            the bits to set
	 */
	@Override
	public void setBits(boolean bits) {
		this.bits = bits;
	}

	public Long getX() {
		return x;
	}

	public void setX(Long x) {
		this.x = x;
	}

	public Set<Long> getY() {
		return y;
	}

	public void setY(Set<Long> y) {
		this.y = y;
	}

	/**
	 * @return the initialState
	 */
	@Override
	public InitialState getInitialState() {
		return initialState;
	}

	/**
	 * @param initialState
	 *            the initialState to set
	 */
	public void setInitialState(InitialState initialState) {
		this.initialState = initialState;
	}
}