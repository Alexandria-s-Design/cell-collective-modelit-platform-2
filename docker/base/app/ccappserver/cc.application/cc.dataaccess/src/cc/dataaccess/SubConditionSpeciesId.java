/**
 * 
 */
package cc.dataaccess;

import com.mchange.lang.ByteUtils;

/**
 * @author Bryan Kowal
 *
 */
public class SubConditionSpeciesId extends AbstractJSIdentifiable {

	private long subConditionId;

	private long speciesId;

	public SubConditionSpeciesId() {
	}
	
	public SubConditionSpeciesId(String jsId) {
		byte[] jsBytes = ByteUtils.fromHexAscii(jsId);
		final String convertedJsId = new String(jsBytes);
		String[] components = convertedJsId.split(DELIMITER);
		
		this.subConditionId = Long.parseLong(components[0]);
		this.speciesId = Long.parseLong(components[1]);
	}

	public SubConditionSpeciesId(long subConditionId, long speciesId) {
		this.subConditionId = subConditionId;
		this.speciesId = speciesId;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.application.main.json.AbstractJSIdentifiable#toJSIdentifier()
	 */
	@Override
	public String toJSIdentifier() {
		final String jsId = String.format(JS_IDENTIFIER_FORMAT, this.getSubConditionId(), this.getSpeciesId());
		return ByteUtils.toHexAscii(jsId.getBytes());
	}

	/**
	 * @return the subConditionId
	 */
	public long getSubConditionId() {
		return subConditionId;
	}

	/**
	 * @param subConditionId
	 *            the subConditionId to set
	 */
	public void setSubConditionId(long subConditionId) {
		this.subConditionId = subConditionId;
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