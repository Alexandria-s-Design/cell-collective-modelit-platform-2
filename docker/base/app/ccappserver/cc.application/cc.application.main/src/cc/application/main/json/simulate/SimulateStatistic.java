/**
 * 
 */
package cc.application.main.json.simulate;

/**
 * @author Bryan Kowal
 *
 */
public class SimulateStatistic {

	public static enum SimulationType {
		Realtime, Dynamic
	}

	public SimulateStatistic() {
	}
	
	private SimulationType type;
	
	private int simulations;
	
	private long runtime;

	/**
	 * @return the type
	 */
	public SimulationType getType() {
		return type;
	}

	/**
	 * @param type the type to set
	 */
	public void setType(SimulationType type) {
		this.type = type;
	}

	/**
	 * @return the simulations
	 */
	public int getSimulations() {
		return simulations;
	}

	/**
	 * @param simulations the simulations to set
	 */
	public void setSimulations(int simulations) {
		this.simulations = simulations;
	}

	/**
	 * @return the runtime
	 */
	public long getRuntime() {
		return runtime;
	}

	/**
	 * @param runtime the runtime to set
	 */
	public void setRuntime(long runtime) {
		this.runtime = runtime;
	}
}