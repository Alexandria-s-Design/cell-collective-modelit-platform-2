/**
 * 
 */
package cc.common.simulate.settings.dynamic;

import java.util.Map;
import java.util.Set;

import cc.common.data.simulation.SpeciesMutation;

/**
 * @author Bryan Kowal
 *
 */
public interface IDynamicSimulationSettings {

	public int getSimulations();

	public void setSimulations(int simulations);

	public Map<Long, ActivityLevelRange> getActivityLevelRange();

	public void setActivityLevelRange(Map<Long, ActivityLevelRange> activityLevelRange);

	public Map<Long, SpeciesMutation> getMutations();

	public void setMutations(Map<Long, SpeciesMutation> mutations);

	public Long getInitialStateId();

	public void setInitialStateId(Long initialStateId);

	public boolean isBits();

	public void setBits(boolean bits);

	public Long getX();

	public void setX(Long x);
	
	public Set<Long> getY();
	
	public void setY(Set<Long> y);
}