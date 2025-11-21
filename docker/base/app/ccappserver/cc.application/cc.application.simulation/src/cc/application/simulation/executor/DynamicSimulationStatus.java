/**
 * 
 */
package cc.application.simulation.executor;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.simulation.SimulationState;

/**
 * @author Bryan
 */
@JsonInclude(Include.NON_NULL)
public class DynamicSimulationStatus {

	private SimulationState state;

	private Double percentComplete;

	private Long elapsedTime;

	public DynamicSimulationStatus() {
	}

	public DynamicSimulationStatus(SimulationState state) {
		this.state = state;
	}

	public DynamicSimulationStatus(Double percentComplete, long elapsedTime) {
		this.state = SimulationState.RUNNING;
		this.percentComplete = percentComplete;
		this.elapsedTime = elapsedTime;
	}

	/**
	 * @return the state
	 */
	public SimulationState getState() {
		return state;
	}

	/**
	 * @param state
	 *            the state to set
	 */
	public void setState(SimulationState state) {
		this.state = state;
	}

	/**
	 * @return the percentComplete
	 */
	public Double getPercentComplete() {
		return percentComplete;
	}

	/**
	 * @param percentComplete
	 *            the percentComplete to set
	 */
	public void setPercentComplete(Double percentComplete) {
		this.percentComplete = percentComplete;
	}

	/**
	 * @return the elapsedTime
	 */
	public Long getElapsedTime() {
		return elapsedTime;
	}

	/**
	 * @param elapsedTime
	 *            the elapsedTime to set
	 */
	public void setElapsedTime(Long elapsedTime) {
		this.elapsedTime = elapsedTime;
	}

	@Override
	public String toString() {
		boolean comma = false;
		StringBuilder sb = new StringBuilder("DynamicSimulationStatus [");
		if (this.state != null) {
			comma = true;
			sb.append(this.state.name());
		}
		if (this.percentComplete != null) {
			if (comma) {
				sb.append(", ");
			}
			sb.append(this.percentComplete);
			comma = true;
		}
		if (this.elapsedTime != null) {
			if (comma) {
				sb.append(", ");
			}
			sb.append(this.elapsedTime);
		}
		sb.append("]");
		return sb.toString();
	}
}