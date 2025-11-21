/**
 * 
 */
package cc.dataaccess;

import com.mchange.lang.ByteUtils;

/**
 * @author Bryan Kowal
 *
 */
public class ConditionSpeciesId extends AbstractJSIdentifiable {

	private long conditionId;

	private long speciesId;

	public ConditionSpeciesId() {
	}
	
	public ConditionSpeciesId(String jsId) {
		byte[] jsBytes = ByteUtils.fromHexAscii(jsId);
		final String convertedJsId = new String(jsBytes);
		String[] components = convertedJsId.split(DELIMITER);
		
		this.conditionId = Long.parseLong(components[0]);
		this.speciesId = Long.parseLong(components[1]);
	}

	public ConditionSpeciesId(long conditionId, long speciesId) {
		this.conditionId = conditionId;
		this.speciesId = speciesId;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.application.main.json.AbstractJSIdentifiable#toJSIdentifier()
	 */
	@Override
	public String toJSIdentifier() {
		final String jsId = String.format(JS_IDENTIFIER_FORMAT, this.getConditionId(), this.getSpeciesId());
		return ByteUtils.toHexAscii(jsId.getBytes());
	}

	/**
	 * @return the conditionId
	 */
	public long getConditionId() {
		return conditionId;
	}

	/**
	 * @param conditionId
	 *            the conditionId to set
	 */
	public void setConditionId(long conditionId) {
		this.conditionId = conditionId;
	}

	/**
	 * @return the speciesId
	 */
	public long getSpeciesId() {
		return speciesId;
	}

	/**
	 * @param speciesId
	 *            the speciesId to set
	 */
	public void setSpeciesId(long speciesId) {
		this.speciesId = speciesId;
	}
}