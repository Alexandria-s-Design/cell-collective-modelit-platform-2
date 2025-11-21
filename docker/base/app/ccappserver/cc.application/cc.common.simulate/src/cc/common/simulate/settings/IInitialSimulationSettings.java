/**
 * 
 */
package cc.common.simulate.settings;

import cc.common.data.simulation.InitialState;

/**
 * @author Bryan Kowal
 *
 */
public interface IInitialSimulationSettings extends ISimulationSettings {
	
	public InitialState getInitialState();
	
}