/**
 * 
 */
package cc.dataaccess;

import java.util.Map;

/**
 * @author Bryan Kowal
 */
public class IdReturnValue {

	private final Map<String, ModelBiologicIdMap> idMap;

	private final Map<Integer, Long> numericIdMap;

	public IdReturnValue(final Map<String, ModelBiologicIdMap> idMap, final Map<Integer, Long> numericIdMap) {
		this.idMap = idMap;
		this.numericIdMap = numericIdMap;
	}

	public Map<String, ModelBiologicIdMap> getIdMap() {
		return idMap;
	}

	public Map<Integer, Long> getNumericIdMap() {
		return numericIdMap;
	}
}