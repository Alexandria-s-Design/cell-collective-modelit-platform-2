/**
 * 
 */
package cc.dataaccess;

import com.mchange.lang.ByteUtils;

/**
 * @author Bryan Kowal
 *
 */
public class InitialStateSpeciesId extends AbstractJSIdentifiable {

	private long initialStateId;

	private long speciesId;

	/**
	 * 
	 */
	public InitialStateSpeciesId() {
	}

	public InitialStateSpeciesId(String jsId) {
		byte[] jsBytes = ByteUtils.fromHexAscii(jsId);
		final String convertedJsId = new String(jsBytes);
		String[] components = convertedJsId.split(DELIMITER);

		this.initialStateId = Long.parseLong(components[0]);
		this.speciesId = Long.parseLong(components[1]);
	}

	public InitialStateSpeciesId(long initialStateId, long speciesId) {
		this.initialStateId = initialStateId;
		this.speciesId = speciesId;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.dataaccess.AbstractJSIdentifiable#toJSIdentifier()
	 */
	@Override
	public String toJSIdentifier() {
		final String jsId = String.format(JS_IDENTIFIER_FORMAT, this.getInitialStateId(), this.getSpeciesId());
		return ByteUtils.toHexAscii(jsId.getBytes());
	}

	/**
	 * @return the initialStateId
	 */
	public long getInitialStateId() {
		return initialStateId;
	}

	/**
	 * @param initialStateId
	 *            the initialStateId to set
	 */
	public void setInitialStateId(long initialStateId) {
		this.initialStateId = initialStateId;
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