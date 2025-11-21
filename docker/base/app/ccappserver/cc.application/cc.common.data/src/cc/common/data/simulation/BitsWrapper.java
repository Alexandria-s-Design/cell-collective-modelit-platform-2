/**
 * 
 */
package cc.common.data.simulation;

import java.util.Map;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Bryan Kowal
 */
@XmlRootElement(name = "bits")
public class BitsWrapper {

	private Map<Long, Integer> bitsMap;

	public BitsWrapper() {
	}

	public BitsWrapper(Map<Long, Integer> bitsMap) {
		this.bitsMap = bitsMap;
	}

	/**
	 * @return the bitsMap
	 */
	public Map<Long, Integer> getBitsMap() {
		return bitsMap;
	}

	/**
	 * @param bitsMap
	 *            the bitsMap to set
	 */
	public void setBitsMap(Map<Long, Integer> bitsMap) {
		this.bitsMap = bitsMap;
	}
}