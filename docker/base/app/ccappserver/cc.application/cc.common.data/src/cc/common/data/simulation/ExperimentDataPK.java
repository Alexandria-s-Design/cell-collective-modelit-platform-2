/**
 * 
 */
package cc.common.data.simulation;

import java.io.Serializable;

import javax.persistence.Embeddable;

/**
 * @author Bryan Kowal
 */
@Embeddable
public class ExperimentDataPK implements Serializable {

	private static final long serialVersionUID = 5815181234462065718L;

	private long experiment_id;

	private long simulation;

	private long calcIntervalId;

	public ExperimentDataPK() {
	}

	public ExperimentDataPK(long experiment_id, long simulation, long calcIntervalId) {
		this.experiment_id = experiment_id;
		this.simulation = simulation;
		this.calcIntervalId = calcIntervalId;
	}

	/**
	 * @return the experiment_id
	 */
	public long getExperiment_id() {
		return experiment_id;
	}

	/**
	 * @param experiment_id
	 *            the experiment_id to set
	 */
	public void setExperiment_id(long experiment_id) {
		this.experiment_id = experiment_id;
	}

	/**
	 * @return the simulation
	 */
	public long getSimulation() {
		return simulation;
	}

	/**
	 * @param simulation
	 *            the simulation to set
	 */
	public void setSimulation(long simulation) {
		this.simulation = simulation;
	}

	/**
	 * @return the calcIntervalId
	 */
	public long getCalcIntervalId() {
		return calcIntervalId;
	}

	/**
	 * @param calcIntervalId
	 *            the calcIntervalId to set
	 */
	public void setCalcIntervalId(long calcIntervalId) {
		this.calcIntervalId = calcIntervalId;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (int) (calcIntervalId ^ (calcIntervalId >>> 32));
		result = prime * result + (int) (experiment_id ^ (experiment_id >>> 32));
		result = prime * result + (int) (simulation ^ (simulation >>> 32));
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ExperimentDataPK other = (ExperimentDataPK) obj;
		if (calcIntervalId != other.calcIntervalId)
			return false;
		if (experiment_id != other.experiment_id)
			return false;
		if (simulation != other.simulation)
			return false;
		return true;
	}
}