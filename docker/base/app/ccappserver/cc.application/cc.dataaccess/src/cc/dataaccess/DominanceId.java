/**
 * 
 */
package cc.dataaccess;

import com.mchange.lang.ByteUtils;

/**
 * @author Bryan Kowal
 *
 */
public class DominanceId extends AbstractJSIdentifiable {

	private long negativeRegulatorId;

	private long positiveRegulatorId;

	public DominanceId() {
	}

	public DominanceId(String jsId) {
		byte[] jsBytes = ByteUtils.fromHexAscii(jsId);
		final String convertedJsId = new String(jsBytes);
		String[] components = convertedJsId.split(DELIMITER);

		this.negativeRegulatorId = Long.parseLong(components[0]);
		this.positiveRegulatorId = Long.parseLong(components[1]);
	}

	public DominanceId(long negativeRegulatorId, long positiveRegulatorId) {
		this.negativeRegulatorId = negativeRegulatorId;
		this.positiveRegulatorId = positiveRegulatorId;
	}

	@Override
	public String toJSIdentifier() {
		final String jsId = String.format(JS_IDENTIFIER_FORMAT, this.getNegativeRegulatorId(), this.getPositiveRegulatorId());
		return ByteUtils.toHexAscii(jsId.getBytes());
	}

	/**
	 * @return the negativeRegulatorId
	 */
	public long getNegativeRegulatorId() {
		return negativeRegulatorId;
	}

	/**
	 * @param negativeRegulatorId
	 *            the negativeRegulatorId to set
	 */
	public void setNegativeRegulatorId(long negativeRegulatorId) {
		this.negativeRegulatorId = negativeRegulatorId;
	}

	/**
	 * @return the positiveRegulatorId
	 */
	public long getPositiveRegulatorId() {
		return positiveRegulatorId;
	}

	/**
	 * @param positiveRegulatorId
	 *            the positiveRegulatorId to set
	 */
	public void setPositiveRegulatorId(long positiveRegulatorId) {
		this.positiveRegulatorId = positiveRegulatorId;
	}
}