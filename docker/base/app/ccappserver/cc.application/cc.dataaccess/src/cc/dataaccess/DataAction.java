/**
 * 
 */
package cc.dataaccess;

/**
 * @author Bryan Kowal
 *
 */
public enum DataAction {
	SAVE("Saved: %s"), UPDATE("Updated: %s"), DELETE("Deleted: %s");

	private final String logMsgFormat;

	private DataAction(String logMsgFormat) {
		this.logMsgFormat = logMsgFormat;
	}

	/**
	 * @return the logMsgFormat
	 */
	public String getLogMsgFormat() {
		return logMsgFormat;
	}
}