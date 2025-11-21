/**
 * 
 */
package cc.application.simulation.configuration;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Bryan
 */
@XmlRootElement(name = "simulationConfiguration")
public class SimulationConfiguration {

	public static final String DEFAULT_FILE_NAME = "simulation-config.xml";
	
	private int maxDynamicSimulationCount = 10;

	public SimulationConfiguration() {
	}

	/**
	 * @return the maxDynamicSimulationCount
	 */
	public int getMaxDynamicSimulationCount() {
		return maxDynamicSimulationCount;
	}

	/**
	 * @param maxDynamicSimulationCount the maxDynamicSimulationCount to set
	 */
	public void setMaxDynamicSimulationCount(int maxDynamicSimulationCount) {
		this.maxDynamicSimulationCount = maxDynamicSimulationCount;
	}
}