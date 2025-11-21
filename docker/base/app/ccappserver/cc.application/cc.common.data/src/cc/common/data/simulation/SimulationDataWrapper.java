/**
 * 
 */
package cc.common.data.simulation;

import javax.xml.bind.annotation.XmlRootElement;

import java.util.Map;

/**
 * @author Bryan Kowal
 */
@XmlRootElement(name = "experimentData")
public class SimulationDataWrapper {

	private Map<Long, Double> dataMap;

	public SimulationDataWrapper() {
	}

	public SimulationDataWrapper(Map<Long, Double> dataMap) {
		this.dataMap = dataMap;
	}

	/**
	 * @return the dataMap
	 */
	public Map<Long, Double> getDataMap() {
		return dataMap;
	}

	/**
	 * @param dataMap
	 *            the dataMap to set
	 */
	public void setDataMap(Map<Long, Double> dataMap) {
		this.dataMap = dataMap;
	}
}