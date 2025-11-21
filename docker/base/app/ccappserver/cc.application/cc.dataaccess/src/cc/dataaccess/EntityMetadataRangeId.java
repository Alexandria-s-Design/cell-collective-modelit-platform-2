/**
 * 
 */
package cc.dataaccess;

import com.mchange.lang.ByteUtils;

/**
 * @author Bryan Kowal
 *
 */
public class EntityMetadataRangeId extends AbstractJSIdentifiable {

	private long entityId;

	private long valueId;

	public EntityMetadataRangeId() {
	}

	public EntityMetadataRangeId(long entityId, long valueId) {
		this.entityId = entityId;
		this.valueId = valueId;
	}

	public EntityMetadataRangeId(String jsId) {
		byte[] jsBytes = ByteUtils.fromHexAscii(jsId);
		final String convertedJsId = new String(jsBytes);
		String[] components = convertedJsId.split(DELIMITER);

		this.entityId = Long.parseLong(components[0]);
		this.valueId = Long.parseLong(components[1]);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.dataaccess.AbstractJSIdentifiable#toJSIdentifier()
	 */
	@Override
	public String toJSIdentifier() {
		final String jsId = String.format(JS_IDENTIFIER_FORMAT, this.getEntityId(), this.getValueId());
		return ByteUtils.toHexAscii(jsId.getBytes());
	}

	/**
	 * @return the entityId
	 */
	public long getEntityId() {
		return entityId;
	}

	/**
	 * @param entityId
	 *            the entityId to set
	 */
	public void setEntityId(long entityId) {
		this.entityId = entityId;
	}

	/**
	 * @return the valueId
	 */
	public long getValueId() {
		return valueId;
	}

	/**
	 * @param valueId
	 *            the valueId to set
	 */
	public void setValueId(long valueId) {
		this.valueId = valueId;
	}
}