/**
 * 
 */
package cc.application.simulation.executor;

import cc.common.data.simulation.SimulationState;

/**
 * @author Bryan
 *
 */
public interface IDynamicSimulationProgressListener {

	public void stateUpdate(final long id, final SimulationState state);

	public void progressUpdate(final long id, final DynamicSimulationStatus status);

}